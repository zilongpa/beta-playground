import cloneDeep from "lodash/cloneDeep";
import * as React from "react";

import {
  Card,
  Classes,
  ContextMenu,
  H5,
  Icon,
  Intent,
  Switch,
  Tooltip,
  Tree,
  type TreeNodeInfo,
} from "@blueprintjs/core";
import { memo } from "react";

type NodePath = number[];

type TreeAction =
  | {
      type: "SET_IS_EXPANDED";
      payload: { path: NodePath; isExpanded: boolean };
    }
  | { type: "DESELECT_ALL" }
  | {
      type: "SET_IS_SELECTED";
      payload: { path: NodePath; isSelected: boolean };
    };

interface TimelineProps {
  frames: Array<any>;
}

function forEachNode(
  nodes: TreeNodeInfo[] | undefined,
  callback: (node: TreeNodeInfo) => void
) {
  if (nodes === undefined) {
    return;
  }

  for (const node of nodes) {
    callback(node);
    forEachNode(node.childNodes, callback);
  }
}

function forNodeAtPath(
  nodes: TreeNodeInfo[],
  path: NodePath,
  callback: (node: TreeNodeInfo) => void
) {
  callback(Tree.nodeFromPath(path, nodes));
}

function timelineReducer(state: TreeNodeInfo[], action: TreeAction) {
  switch (action.type) {
    case "DESELECT_ALL":
      const newState1 = cloneDeep(state);
      forEachNode(newState1, (node) => (node.isSelected = false));
      return newState1;
    case "SET_IS_EXPANDED":
      const newState2 = cloneDeep(state);
      forNodeAtPath(
        newState2,
        action.payload.path,
        (node) => (node.isExpanded = action.payload.isExpanded)
      );
      return newState2;
    case "SET_IS_SELECTED":
      const newState3 = cloneDeep(state);
      forNodeAtPath(
        newState3,
        action.payload.path,
        (node) => (node.isSelected = action.payload.isSelected)
      );
      return newState3;
    default:
      return state;
  }
}

const Timeline = ({ frames }: TimelineProps) => {
  const [compact, setCompact] = React.useState(false);
  const [nodes, dispatch] = React.useReducer(timelineReducer, convertToTreeNodes(frames));

  const handleNodeClick = React.useCallback(
    (
      node: TreeNodeInfo,
      nodePath: NodePath,
      e: React.MouseEvent<HTMLElement>
    ) => {
      const originallySelected = node.isSelected;
      if (!e.shiftKey) {
        dispatch({ type: "DESELECT_ALL" });
      }
      dispatch({
        payload: {
          path: nodePath,
          isSelected: originallySelected == null ? true : !originallySelected,
        },
        type: "SET_IS_SELECTED",
      });
    },
    []
  );

  const handleNodeCollapse = React.useCallback(
    (_node: TreeNodeInfo, nodePath: NodePath) => {
      dispatch({
        payload: { path: nodePath, isExpanded: false },
        type: "SET_IS_EXPANDED",
      });
    },
    []
  );

  const handleNodeExpand = React.useCallback(
    (_node: TreeNodeInfo, nodePath: NodePath) => {
      dispatch({
        payload: { path: nodePath, isExpanded: true },
        type: "SET_IS_EXPANDED",
      });
    },
    []
  );

  return (
    <div style={{ maxHeight: "100%", width: "100%", overflowY: "auto" }}>
      <Tree
        compact={compact}
        contents={nodes}
        onNodeClick={handleNodeClick}
        onNodeCollapse={handleNodeCollapse}
        onNodeExpand={handleNodeExpand}
      />
    </div>
  );
};

const contentSizing = {
  popoverProps: { popoverClassName: Classes.POPOVER_CONTENT_SIZING },
};

const data = [
  {
    offsetOfInstruction: 4,
    titleOfInstruction: "SUBC",
    iconOfInstruction: "cog",
    titleOfStep: "Decode: Decode the instruction",
    descriptionOfStep:
      "Decode the fetched instruction and identify operands and operation.",
    iconOfStep: "cog",
    exception: false,
    exitingDueToException: false,
  },
  {
    offsetOfInstruction: 4,
    titleOfInstruction: "SUBC",
    iconOfInstruction: "cog",
    titleOfStep: "Execute: Execute the instruction",
    descriptionOfStep: "Execute the decoded instruction.",
    iconOfStep: "cog",
    exception: false,
    exitingDueToException: false,
  },
  {
    offsetOfInstruction: 8,
    titleOfInstruction: "ADD",
    iconOfInstruction: "plus",
    titleOfStep: "Decode: Decode the instruction",
    descriptionOfStep:
      "Decode the fetched instruction and identify operands and operation.",
    iconOfStep: "cog",
    exception: false,
    exitingDueToException: false,
  },
];


interface NodeData {
    offsetOfInstruction: number;
}

const convertToTreeNodes = (data: any[]): TreeNodeInfo<NodeData>[] => {
  const treeNodes: TreeNodeInfo<NodeData>[] = [];
  let currentParent: TreeNodeInfo<NodeData> | undefined = undefined;

  data.forEach((item, index) => {
    const newNode: TreeNodeInfo<NodeData> = {
      id: index,
      icon: item.iconOfStep,
      label: item.titleOfStep,
      nodeData: { offsetOfInstruction: item.offsetOfInstruction},
      secondaryLabel: (
        <Tooltip content={item.descriptionOfStep}>
          <Icon icon="info-sign" />
        </Tooltip>
      ),
      childNodes: [],
    };

    if (currentParent && currentParent.nodeData && currentParent.nodeData.offsetOfInstruction === item.offsetOfInstruction) {
        // console.log('currentParent', currentParent);
      currentParent.childNodes?.push(newNode);
    } else {
        const newParent: TreeNodeInfo<NodeData> = {
            id: index,
            icon: item.iconOfInstruction,
            label: item.titleOfInstruction,
            nodeData: { offsetOfInstruction: item.offsetOfInstruction},
            // secondaryLabel: (
            //   <Tooltip content={item.descriptionOfStep}>
            //     <Icon icon="info-sign" />
            //   </Tooltip>
            // ),
            childNodes: [],
          };
      

      treeNodes.push(newParent);
      currentParent = newParent;
      currentParent.childNodes?.push(newNode);
    }
  });

  return treeNodes;
};

export default memo(Timeline);