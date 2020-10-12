type RelationID = string;
type NodeID = string;

interface GraphHash {
  [key: string]: NodeID[];
}
interface NodeGraphPosition {
  depth: number;
  width: number;
}

interface NodeIDBoolHash {
  [key: string]: boolean;
}

interface NodeHash {
  [key: string]: Node;
}

interface RelationHash {
  [key: string]: Relation;
}

export class Point {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

export class Node extends Point {
  id: NodeID;
  name: string;

  constructor(id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }
}

export class Relation {
  parent: NodeID;
  child: NodeID;
  id: RelationID;

  constructor(parent_id: NodeID, child_id: NodeID) {
    this.parent = parent_id;
    this.child = child_id;
    this.id = this.generateID(parent_id, child_id);
  }

  static get SEPARATOR(): string {
    return "-";
  }

  generateID(nodeID_a: NodeID, nodeID_b: NodeID): string {
    return [nodeID_a, nodeID_b].sort().join(Relation.SEPARATOR);
  }

  static deconstructID(relation_id: RelationID): string[] {
    return relation_id.split(this.SEPARATOR);
  }

  // alias child
  get start(): NodeID {
    return this.child;
  }

  // alias child
  set start(node: NodeID) {
    this.child = node;
  }

  // alias parent
  get end(): NodeID {
    return this.parent;
  }

  // alias parent
  set end(node: NodeID) {
    this.parent = node;
  }
}

export class Field {
  nodes: NodeHash = {};
  relations: RelationHash = {};

  get nodesArray(): Node[] {
    return Object.values(this.nodes);
  }

  get relationsArray(): Relation[] {
    return Object.values(this.relations);
  }

  addNode(name: string): Node {
    let node = new Node(this.generateID(), name);
    this.nodes[node.id] = node;
    return node;
  }

  generateID(): string {
    let int_id = this.nodesArray.reduce(
      (acc, item) => (+item.id >= +acc ? +item.id + 1 : +acc),
      0
    );
    return int_id.toString();
  }

  addRelation(parent_id: NodeID, child_id: NodeID) {
    let relation = new Relation(parent_id, child_id);
    if (!this.getRelationByID(relation.id)) {
      this.relations[relation.id] = relation;
    }
  }

  getNodeByID(node_id: NodeID): Node {
    return this.nodes[node_id];
  }

  getRelationByID(relation_id: RelationID): Relation {
    return this.relations[relation_id];
  }

  getRelationsFromNodeID(node_id: NodeID): Relation[] {
    let relations: Relation[] = [];
    this.relationsArray.forEach(item => {
      if (item.parent === node_id || item.child === node_id)
        relations.push(item);
    });
    return relations;
  }

  getNodesFromRelationID(relation_id: RelationID): Node[] {
    let relation = this.getRelationByID(relation_id);
    return [this.nodes[relation.parent], this.nodes[relation.child]];
  }

  deleteNodeByID(node_id: NodeID, persist_inheritance = false) {
    if (!this.nodes[node_id]) return;
    delete this.nodes[node_id];

    let relations = this.getRelationsFromNodeID(node_id);
    if (!persist_inheritance) {
      // delete relations
      relations.forEach(({ id }) => this.deleteRelationByID(id));
    } else {
      // TODO: transfer relations
    }
  }

  deleteRelationByID(id: RelationID) {
    console.log("deleting relation " + id);
    delete this.relations[id];
  }

  getParents(node_id: NodeID): Node[] {
    let relations = this.getRelationsFromNodeID(node_id);
    let parents: Node[] = [];
    relations.map(({ parent, child }) => {
      if (parent === node_id) parents.push(this.getNodeByID(child));
    });
    return parents;
  }

  getChildren(node_id: NodeID): Node[] {
    let relations = this.getRelationsFromNodeID(node_id);
    let children: Node[] = [];
    relations.map(({ parent, child }) => {
      if (child === node_id) children.push(this.getNodeByID(parent));
    });
    return children;
  }

  checkAcyclicRecursive(node_id = null): boolean {
    let graph = this.getTopDownGraph();
    graph.root = [...Object.keys(graph)];
    let nodes = node_id ? [node_id] : Object.keys(this.nodes);
    const cycle = (
      id: NodeID,
      visited: NodeIDBoolHash,
      stack_trace: NodeID[]
    ): boolean => {
      // console.log(stack_trace);
      if (visited[id]) return true;
      visited[id] = true;
      let children = graph[id];
      if (children) {
        return children.some(id2 =>
          cycle(id2, Object.assign({}, visited), [...stack_trace, id2])
        );
      }
      return false;
    };

    for (let j = 0; j < nodes.length; j++) {
      let visited: NodeIDBoolHash = {};
      if (cycle(nodes[j]!, visited, [nodes[j]!])) return true;
    }

    return false;
  }

  checkAcyclicLoop(node_id = null): boolean {
    let graph = this.getTopDownGraph();
    graph.root = [...Object.keys(graph)];
    let nodes = node_id ? [node_id] : Object.keys(this.nodes);
    // node id: is visited
    let visited: NodeIDBoolHash = {};
    // node id: on stack
    let on_stack: NodeIDBoolHash = {};
    let stack_trace: NodeID[] = [];

    for (let w = 0; w < nodes.length; w++) {
      if (visited[w] === true) continue;
      // add node id to stack
      stack_trace.push(nodes[w]!);

      while (stack_trace.length > 0) {
        // set current to top item on stack
        let current = stack_trace[stack_trace.length - 1];
        if (!visited[current]) {
          // visit, add to current stack
          visited[current] = true;
          on_stack[current] = true;
        } else {
          // going back ? remove from current stack
          on_stack[current] = false;
          stack_trace.pop();
        }

        const children: NodeID[] = graph[current] || [];

        for (const v of children) {
          if (!visited[v]) {
            // not visited, so add to stack (but dont visit or count in the current stack yet)
            stack_trace.push(v);
          } else if (on_stack[v]) {
            // already on current stack, its a loop
            return true;
          }
        }
      }
    }
    return false;
  }

  traverseDepth(
    fnAtNode = (x: Node, options: NodeGraphPosition) => console.log(x),
    ignoreCyclic = false
  ) {
    if (!ignoreCyclic) {
      if (this.checkAcyclicLoop()) return null;
    }

    let graph = this.getTopDownGraph();
    let nodes = this.nodesArray;

    let visited: NodeIDBoolHash = {};
    let on_stack: NodeIDBoolHash = {};
    let stack_trace: Node[] = [];

    for (let n = 0; n < nodes.length; n++) {
      let width = 1;
      if (visited[n] === true) continue;
      stack_trace.push(nodes[n]);

      while (stack_trace.length > 0) {
        let current = stack_trace[stack_trace.length - 1];
        if (!visited[current.id]) {
          fnAtNode(current, { depth: stack_trace.length, width });
          width--;
          visited[current.id] = true;
          on_stack[current.id] = true;
        } else {
          width = 1;
          on_stack[current.id] = false;
          stack_trace.pop();
        }

        const children: NodeID[] = graph[current.id] || [];
        width += children.length;
        for (const v of children) {
          if (!visited[v]) {
            // not visited, so add to stack (but dont visit or count in the current stack yet)
            stack_trace.push(this.getNodeByID(v));
          }
        }
      }
    }
  }

  traverseBreadth(
    fnAtNode = (x: Node, options: NodeGraphPosition) => console.log(x),
    ignoreCyclic = false
  ) {
    if (!ignoreCyclic) {
      if (this.checkAcyclicLoop()) return null;
    }

    let nodesArray = this.nodesArray;
    let que: NodeID[] = [];
    let depths: number[] = [];
    let widths: number[] = [];
    while (que.length > 0) {
      let queLastIndex = que.length - 1;
      const node = this.getNodeByID(que[queLastIndex]);
      let nodeDepth = depths[queLastIndex];
      fnAtNode(node, { depth: nodeDepth, width: widths[queLastIndex] });
      let children = this.getChildren(node.id);
      for (let n = 1; n <= children.length; n++) {
        que.unshift(children[n].id);
        widths.unshift(n);
        depths.unshift((nodeDepth || 0) + 1);
      }
      widths.pop();
      depths.pop();
      que.pop();
    }
  }

  // getAncestors(node_id) {}
  //
  // getDescendants(node_id) {}
  //

  // @returns { root:[descendants] }
  getTopDownGraph() {
    return this.relationsArray.reduce((acc: GraphHash, { child, parent }) => {
      (acc[parent] = acc[parent] || []).push(child);
      return acc;
    }, {});
  }

  // @returns { leaf:[ancestors] }
  getBottomUpGraph() {
    return this.relationsArray.reduce((acc: GraphHash, { child, parent }) => {
      (acc[child] = acc[child] || []).push(parent);
      return acc;
    }, {});
  }

  static LayoutSpacingX = 50;
  static LayoutSpacingY = 10;

  autoLayout() {}

  scaleX() {}

  scaleY() {}

  scale() {}
}

export default new Field();
