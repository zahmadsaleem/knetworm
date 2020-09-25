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

  isAcyclic() {
    let graph = this.getTopDownGraph();
    let visited = null;
    graph.root = [...Object.keys(graph)];
    let stack = ["root"];
    let is_acyclic = false;
    let i = 0;
    while (stack.length > 0) {
      console.log(
        `queue ${JSON.stringify(stack)}, visited ${JSON.stringify(
          visited
        )}, graph ${JSON.stringify(graph)}, i ${i}`
      );
      visited = visited || {};
      // [id, []children]
      let id = stack[stack.length - 1]; /* last item */
      let children = graph[id];
      if (visited[id]) {
        is_acyclic = true;
        console.log(`visited---------- ${id}`);
        break;
      }

      if (children) {
        stack.push(...children);
      }
      visited[id] = visited[id] || true;
      stack.pop();
    }
    return is_acyclic;
  }

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
