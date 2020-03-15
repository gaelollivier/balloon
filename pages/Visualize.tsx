import React from 'react';
import { Treemap } from 'react-vis';

import { lighten } from '../utils/color';
import { db, File } from '../utils/db';
import { FOLDER_MIME_TYPE } from '../utils/drive';

// import testData from './data.json';

interface Node {
  name: string;
  isRoot: boolean;
  size?: number;
  children: Array<Node>;
  file: File;
  parent: Node | null;
}

const MAX_DEPTH = 3;

const ROOT_COLOR = '#f7fafc';

const SIZE_BASED_COLORS = [
  '#FEFCBF',
  '#FAF089',
  '#F6E05E',
  '#F6AD55',
  '#ED8936',
  '#DD6B20',
  '#E53E3E',
  '#C53030',
  '#742A2A',
];

const getColor = (rootSize: number) => (node: Node): string => {
  const { size = 0, isRoot } = node;

  if (isRoot) {
    return ROOT_COLOR;
  }

  const sizeFactor = (size / rootSize) * 30;
  const numColors = SIZE_BASED_COLORS.length;
  return SIZE_BASED_COLORS[
    Math.min(numColors - 1, Math.floor(sizeFactor * numColors))
  ];
};

async function loadNode(
  file: File,
  parent: Node | null = null,
  depth = 0
): Promise<Node> {
  const children =
    file.mimeType === FOLDER_MIME_TYPE && depth < MAX_DEPTH
      ? await db.files
          .where('parent')
          .equals(file.id)
          .toArray()
      : [];

  const isLeaf = file.mimeType !== FOLDER_MIME_TYPE || depth >= MAX_DEPTH;

  const node: Node = {
    name: file.name,
    isRoot: depth === 0,
    size: isLeaf ? file.calculatedSize || file.size || 0 : 0,
    children: [],
    file,
    parent,
  };

  node.children = await Promise.all(
    children.map(child => loadNode(child, node, depth + 1))
  );

  return node;
}

async function loadTree(): Promise<Node | null> {
  const {
    result: { id: rootFolderId, mimeType = '', name = '' },
  } = await gapi.client.drive.files.get({ fileId: 'root' });
  if (!rootFolderId) {
    console.error('Cannot find root folder');
    return null;
  }

  return loadNode({
    id: rootFolderId,
    mimeType,
    name,
    parent: null,
    size: 0,
  });
}

function formatSize(size: number = 0): string {
  if (size > 1e9) {
    return `${(size / 1e9).toFixed(2)} GB`;
  } else if (size > 1e6) {
    return `${(size / 1e6).toFixed(2)} MB`;
  } else if (size > 1e3) {
    return `${(size / 1e3).toFixed(2)} KB`;
  }

  return size.toFixed(2);
}

const NodeDetails = ({ node }: { node: Node }) => {
  const getPath = (
    node: Node | null,
    currPath: Array<Node> = []
  ): Array<Node> =>
    node ? getPath(node.parent, [node, ...currPath]) : currPath;

  const path = getPath(node.parent);

  return (
    <>
      <ul className="flex flex-row justify-center">
        {path.map((parentNode, i) => (
          <li key={i} className="mr-4 p-2 bg-gray-300 rounded">
            {parentNode.name}
          </li>
        ))}
        <li className="flex items-center">
          {node.name} - {formatSize(node.size)}
        </li>
      </ul>
    </>
  );
};

const Visualize = () => {
  const [rootNode, setRootNode] = React.useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = React.useState<Node | null>(null);
  const [selectedNode, setselectedNode] = React.useState<Node | null>(null);

  React.useEffect(() => {
    loadTree().then(node => setRootNode(node));
  }, []);

  const handleMouseOver = ({ data }: { data: Node }) => setHoveredNode(data);
  const handleMouseClick = ({ data }: { data: Node }) => {
    console.log(data);
    setselectedNode(data);
  };

  const rootSize = (rootNode?.children || []).reduce(
    (sum, { file }) => sum + (file.calculatedSize || 0),
    0
  );

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      {!rootNode && 'Loading...'}
      <div className="flex flex-row">
        {SIZE_BASED_COLORS.map((color, i) => (
          <div
            key={i}
            style={{ width: 20, height: 20, backgroundColor: color }}
          />
        ))}
      </div>
      {rootNode && (
        <Treemap
          title={'My New Treemap'}
          width={500}
          height={500}
          margin={1}
          data={rootNode}
          renderMode="DOM"
          mode="binary"
          colorType="literal"
          style={{ border: 'thin solid rgba(100, 100, 100, 0.1)' }}
          onLeafMouseOver={handleMouseOver}
          onLeafMouseOut={() => setHoveredNode(null)}
          onLeafClick={handleMouseClick}
          getColor={(node: Node) =>
            node === hoveredNode || node === selectedNode
              ? lighten(getColor(rootSize)(node))
              : getColor(rootSize)(node)
          }
        />
      )}
      <div style={{ minHeight: 70, paddingTop: 8 }}>
        {hoveredNode ? (
          <NodeDetails node={hoveredNode} />
        ) : (
          selectedNode && <NodeDetails node={selectedNode} />
        )}
      </div>
    </div>
  );
};

export default Visualize;
