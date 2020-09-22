class Field {
  nodes = [];
  relationships = {
    parent_child: {},
    child_parent: {}
  };

  constructor() {
    this.addNode("root");
  }

  addNode(name) {
    if (this.hasName(name)) {
      return null;
    }
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
    return this.nodes.reduce(
      (acc, item) => (item.id >= acc ? item.id + 1 : acc),
      0
    );
  }
}

class Node {
  #id;
  #name;
  constructor(id, name) {
    this.#id = id;
    this.#name = name;
  }
  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }
}

function cleanString(str) {
  return String.prototype.toLocaleLowerCase(str);
}

export default new Field();
