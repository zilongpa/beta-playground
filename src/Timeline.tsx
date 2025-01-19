import cloneDeep from "lodash/cloneDeep";
import * as React from "react";
import {
  Card,
  Classes,
  ContextMenu,
  H5,
  Icon,
  Intent,
  ResizeSensor,
  Switch,
  Tooltip,
  Tree,
  type TreeNodeInfo,
} from "@blueprintjs/core";
import { memo, useContext, useEffect } from "react";
import { EmulatorContext } from "./emulatorContext";

type NodePath = number[];

type TreeAction =
  | {
      type: "SET_IS_EXPANDED";
      payload: { path: NodePath; isExpanded: boolean };
    }
  | { type: "DESELECT_ALL" }
  | { type: "RESET_TREE"; payload: { newNodes: any } }
  | { type: "SET_IS_EXPANDED_ALL"; payload: { isExpanded: boolean } }
  | {
      type: "SET_IS_SELECTED";
      payload: { path: NodePath; isSelected: boolean };
    };

interface TimelineProps {
  frames: Array<any>;
  currentFrame: number;
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

function timelineReducer(state: TreeNodeInfo<NodeData>[], action: TreeAction) {
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
    case "SET_IS_EXPANDED_ALL":
      const newState4 = cloneDeep(state);
      forEachNode(newState4, (node) => (node.isExpanded = action.payload.isExpanded));
      return newState4;
    case "RESET_TREE":
        return action.payload.newNodes; 
      default:
        return state;
  }
}


const Timeline = () => {
  const { frames, currentFrame } = useContext(EmulatorContext);

  const [nodes, dispatch] = React.useReducer(
    timelineReducer,
    convertToTreeNodes(frames, currentFrame)
  );

  useEffect(() => {
    const newNodes = convertToTreeNodes(frames, currentFrame);
    dispatch({
      type: "RESET_TREE",
      payload: {
        newNodes,
      },
    });
  }, [frames, currentFrame]);

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
      {/* {JSON.stringify(frames[currentFrame])} */}
      <Tree
        contents={nodes}
        onNodeClick={handleNodeClick}
        onNodeCollapse={handleNodeCollapse}
        onNodeExpand={handleNodeExpand}
      />
    </div>
  );
};

interface NodeData {
  offsetOfInstruction: number;
}

const convertToTreeNodes = (data: any[], currentFrame: number): TreeNodeInfo<NodeData>[] => {
  const treeNodes: TreeNodeInfo<NodeData>[] = [];
  let currentParent: TreeNodeInfo<NodeData> | undefined = undefined;

  data.forEach((item, index) => {
    const newNode: TreeNodeInfo<NodeData> = {
      id: index,
      icon: item.iconOfStep,
      label: <Tooltip content={item.descriptionOfStep}>{item.titleOfStep}</Tooltip>,
      isExpanded: index === currentFrame,
      isSelected: index === currentFrame,
      nodeData: { offsetOfInstruction: item.offsetOfInstruction },
      secondaryLabel: (
        <Icon
          icon={
            index === currentFrame
              ? "hand-left"
              : index < currentFrame
              ? "tick"
              : "time"
          }
          intent={
            index === currentFrame
              ? Intent.PRIMARY
              : index < currentFrame
              ? Intent.SUCCESS
              : Intent.NONE
          }
  
        />
        // </Tooltip>
      ),
      childNodes: [
        {
          id: index,
          label: <Tooltip content={item.descriptionOfStep}>{item.titleOfStep}</Tooltip>,
          nodeData: { offsetOfInstruction: item.offsetOfInstruction },
        },
      ],
    };

    if (
      currentParent &&
      currentParent.nodeData &&
      currentParent.nodeData.offsetOfInstruction === item.offsetOfInstruction
    ) {
      currentParent.childNodes?.push(newNode);
    } else {
      const newParent: TreeNodeInfo<NodeData> = {
        id: index,
        icon: item.iconOfInstruction,
        label: item.titleOfInstruction,
        nodeData: { offsetOfInstruction: item.offsetOfInstruction },
        childNodes: [],
      };

      treeNodes.push(newParent);
      currentParent = newParent;
      currentParent.childNodes?.push(newNode);
    }
    if (index === currentFrame) {
      currentParent.isExpanded = true;
    }
  });

  return treeNodes;
};

const findNodePathByFrame = (
  nodes: TreeNodeInfo<NodeData>[],
  currentFrame: number
): NodePath | null => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === currentFrame) {
      return [i];
    }
    if (node.childNodes) {
      const childPath = findNodePathByFrame(node.childNodes, currentFrame);
      if (childPath) {
        return [i, ...childPath];
      }
    }
  }
  return null;
};

export default Timeline;
