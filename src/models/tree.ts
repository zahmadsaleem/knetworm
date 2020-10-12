export class Field {
  nodes = {};
  relations = {};

  get nodesArray() {
    return Object.values(this.nodes);
  }

  get relationsArray() {
    return Object.values(this.relations);
  }

  addNode(name) {
    let node = new Node(this.generateID(), name);
    this.nodes[node.id] = node;
    return node;
  }

  generateID() {
    let int_id = this.nodesArray.reduce(
      (acc, item) => (+item.id >= +acc ? +item.id + 1 : +acc),
      0
    );
    return int_id.toString();
  }

  addRelation(parent_id, child_id) {
    let relation = new Relation(parent_id, child_id);
    if (!this.getRelationByID(relation.id)) {
      this.relations[relation.id] = relation;
    }
  }

  getNodeByID(node_id) {
    return this.nodes[node_id];
  }

  getRelationByID(relation_id) {
    return this.relations[relation_id];
  }

  getRelationsFromNodeID(node_id) {
    let relations = [];
    this.relationsArray.forEach(item => {
      if (item.parent === node_id || item.child === node_id)
        relations.push(item);
    });
    return relations;
  }

  getNodesFromRelationID(relation_id) {
    let relation = this.getRelationByID(relation_id);
    return [this.nodes[relation.parent], this.nodes[relation.child]];
  }

  deleteNodeByID(node_id, persist_inheritance = false) {
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

  deleteRelationByID(id) {
    console.log("deleting relation " + id);
    delete this.relations[id];
  }

  getParents(node_id) {
    let relations = this.getRelationsFromNodeID(node_id);
    let parents = [];
    relations.map(({ parent, child }) => {
      if (parent === node_id) parents.push(this.getNodeByID(child));
    });
    return parents;
  }

  getChildren(node_id) {
    let relations = this.getRelationsFromNodeID(node_id);
    let children = [];
    relations.map(({ parent, child }) => {
      if (child === node_id) children.push(this.getNodeByID(parent));
    });
    return children;
  }

  checkAcyclicRecursive(node_id = null) {
    let graph = this.getTopDownGraph();
    graph.root = [...Object.keys(graph)];
    let nodes = node_id ? [node_id] : Object.keys(this.nodes);
    const cycle = (id, visited, stack_trace) => {
      console.log(stack_trace);
      if (visited[id] === true) return true;
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
      let visited = {};
      let stack = [nodes[j]];
      if (cycle(nodes[j], visited, stack)) return true;
    }

    return false;
  }

  checkAcyclicLoop(node_id = null) {
    let graph = this.getTopDownGraph();
    graph.root = [...Object.keys(graph)];
    let nodes = node_id ? [node_id] : Object.keys(this.nodes);
    // node id: is visited
    let visited = {};
    // node id: on stack
    let on_stack = {};
    let stack_trace = [];

    for (let w = 0; w < nodes.length; w++) {
      if (visited[w] === true) continue;
      // add node id to stack
      stack_trace.push(nodes[w]);

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

        const children = graph[current] || [];

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

  traverseDepth(fnAtNode = x => console.log(x), ignoreCyclic = false) {
    if (!ignoreCyclic) {
      if (this.checkAcyclicLoop()) return null;
    }

    let graph = this.getTopDownGraph();
    let nodes = this.nodesArray;

    let visited = {};
    let on_stack = {};
    let stack_trace = [];

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

        const children = graph[current.id] || [];
        width += children.length;
        for (const v of children) {
          if (!visited[v]) {
            // not visited, so add to stack (but dont visit or count in the current stack yet)
            stack_trace.push(v);
          }
        }
      }
    }
  }

  traverseBreadth(fnAtNode = x => console.log(x), ignoreCyclic = false) {
    if (!ignoreCyclic) {
      if (this.checkAcyclicLoop()) return null;
    }

    let nodesArray = this.nodesArray;
    let que = [];
    let depths = [];
    let widths = [];
    while (que.length > 0) {
      let queLastIndex = que.length - 1;
      const node = nodesArray[que[queLastIndex]];
      let nodeDepth = depths[queLastIndex];
      fnAtNode(node, { depth: nodeDepth, width: widths[queLastIndex] });
      let children = this.getChildren(node.id);
      for (let n = 1; n <= children.length; n++) {
        que.unshift(children[n]);
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
    return this.relationsArray.reduce((acc, { child, parent }) => {
      (acc[parent] = acc[parent] || []).push(child);
      return acc;
    }, {});
  }

  // @returns { leaf:[ancestors] }
  getBottomUpGraph() {
    return this.relationsArray.reduce((acc, { child, parent }) => {
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

export class Point {
  x;
  y;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

export class Node extends Point {
  id;
  name;

  constructor(id, name) {
    super();
    this.id = id;
    this.name = name;
  }
}

function cleanString(str) {
  return String.prototype.toLocaleLowerCase(str);
}

export class Relation {
  parent;
  child;
  id;

  constructor(parent_id, child_id) {
    this.parent = parent_id;
    this.child = child_id;
    this.id = this.generateID(parent_id, child_id);
  }

  static get SEPARATOR() {
    return "-";
  }

  generateID(nodeID_a, nodeID_b) {
    return [nodeID_a, nodeID_b].sort().join(Relation.SEPARATOR);
  }

  static deconstructID(relation_id) {
    return relation_id.split(this.SEPARATOR);
  }

  // alias child
  get start() {
    return this.child;
  }

  // alias child
  set start(node) {
    this.child = node;
  }

  // alias parent
  get end() {
    return this.parent;
  }

  // alias parent
  set end(node) {
    this.parent = node;
  }
}

export default new Field();
