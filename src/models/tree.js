class Field {
  nodes = [];
  relations = [];

  addNode(name) {
    // if (this.hasName(name)) {
    //   return null;
    // }
    let node = new Node(this.generateID(), name);
    this.nodes.push(node);
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
    let int_id = this.nodes.reduce(
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
    return getItemByID(this.nodes, node_id);
  }
  getRelationByID(relation_id) {
    return getItemByID(this.relations, relation_id);
  }

  getRelationsFromNodeID(node_id) {
    return this.relations.map((r, i) => {
      let [a, b] = Relation.deconstructID(r.id);
      if (a === node_id || b === node_id) {
        return { id: r.id, item: r, index: i };
      }
    });
  }

  getNodesFromRelationID(relation_id) {
    let [a, b] = Relation.deconstructID(relation_id);
    return this.nodes.map((node, i) => {
      if (a === node.id || b === node.id) {
        return { id: node.id, item: node, index: i };
      }
    });
  }

  deleteNodeByID(node_id, persist_inheritance = false) {
    if (!deleteItemByID(this.nodes, node_id).length) return;

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
