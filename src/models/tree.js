class Field {
  nodes = {};
  relations = [];

  addNode(name) {
    // if (this.hasName(name)) {
    //   return null;
    // }
    let node = new Node(this.generateID(), name);
    this.nodes[node.id] = node;
    return node;
  }

  hasName(name) {
    return (
      !!name &&
      this.nodes.findIndex(x => cleanString(x.name) === cleanString(name)) !==
        -1
    );
  }

  generateID() {
    let int_id = Object.values(this.nodes).reduce(
      (acc, item) => (+item.id >= +acc ? +item.id + 1 : +acc),
      0
    );
    return int_id.toString();
  }

  addRelation(parent, child) {
    let relation = new Relation(parent, child);
    if (!this.getRelationByID(relation.id)) {
      this.relations.push(relation);
    }
  }

  getNodeByID(node_id) {
    return this.nodes[node_id];
  }

  getRelationByID(relation_id) {
    return getItemByID(this.relations, relation_id);
  }

  getRelationsFromNodeID(node_id) {
    let relations = [];
    this.relations.map((relation, index) => {
      if (relation.parent.id === node_id || relation.child.id === node_id)
        relations.push({ item: relation, index });
    });
    return relations;
  }

  getNodesFromRelationID(relation_id) {
    let relation = this.getRelationByID(relation_id);
    return [this.nodes[relation.parent.id], this.nodes[relation.child.id]];
  }

  deleteNodeByID(node_id, persist_inheritance = false) {
    if (!this.nodes[node_id]) return;
    delete this.nodes[node_id];

    let relations = this.getRelationsFromNodeID(node_id);
    if (!persist_inheritance) {
      // delete relations
      let offset = 0;
      relations.forEach(({ index }) => {
        this.relations.splice(index - offset, 1);
        offset++;
      });
    } else {
      // transfer relations
    }
  }

  deleteRelationByID(id) {
    return deleteItemByID(this.relations, id);
  }

  getParents(node_id) {
    let relations = this.getRelationsFromNodeID(node_id);
    return relations.filter(x => x.child.id === node_id);
  }

  getChildren(node_id) {
    let relations = this.getRelationsFromNodeID(node_id);
    return relations.filter(x => x.parent.id === node_id);
  }

  isAcyclic(node_id = null) {
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

  isAcyclic2(node_id = null) {
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

  traverseDepth() {}

  traverseBreadth() {}

  // getAncestors(node_id) {}
  //
  // getDescendants(node_id) {}
  //

  getTopDownGraph() {
    return this.relations.reduce((acc, item) => {
      (acc[item.parent.id] = acc[item.parent.id] || []).push(item.child.id);
      return acc;
    }, {});
  }

  getBottomUpGraph() {
    return this.relations.reduce((acc, item) => {
      (acc[item.child.id] = acc[item.child.id] || []).push(item.parent.id);
      return acc;
    }, {});
  }

  static LayoutSpacingX = 50;
  static LayoutSpacingY = 10;

  autoLayout() {
    // for all nodes
    // if node has parents
    // move to parents location + spacing (check if space is available, choose space)
    let node_dependency_count = [];

    // count dependencies
    this.relations.map((r, index) => {
      node_dependency_count[index] = (node_dependency_count[index] || 0) + 1;
    });

    // replace dangling
    node_dependency_count.map(([k, v]) => {
      if (v === 0) node_dependency_count[k] = 1;
    });

    // introduce new root
    node_dependency_count["root"] = 0;

    // do dfs
    // nodeID : isVisited
  }

  scaleX() {}

  scaleY() {}

  scale() {}
}

class Point {
  x;
  y;
}

class Node extends Point {
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

function getItemByID(arr, id) {
  return arr.find(i => i.id === id);
}

function deleteItemByID(arr, id) {
  let index = arr.findIndex(x => x.id === id);
  if (index === -1) return;
  return arr.splice(index, 1);
}

export class Relation {
  parent;
  child;
  id;

  constructor(parent, child) {
    this.parent = parent;
    this.child = child;
    this.id = this.generateID(this.parent.id, this.child.id);
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

  // alias parent
  get end() {
    return this.parent;
  }

  // alias child
  set start(node) {
    this.child = node;
  }

  // alias parent
  set end(node) {
    this.parent = node;
  }
}

export default new Field();
