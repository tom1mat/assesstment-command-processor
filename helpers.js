const commands = ['quit', 'pwd', 'mkdir', 'cd', 'touch', 'ls'];

/*  Helper functions */
exports.hasChild = (name, childs, fileType) => {
  for (const child of childs) {
    if (fileType) {
      if (child.type === fileType && child.name === name) {
        return true;
      }
    } else {
      if (child.name === name) {
        return true;
      }
    }
  }

  return false;
}

exports.existsCommand = command => {
  for (const eachComm of commands)
    if (eachComm === command)
      return true;

  return false;
}

exports.getChild = (name, childs) => {
  if (childs.length) {// If is array
    for (let child of childs) {
      if (child.name === name) {
        return child;
      }
    }
  }

  return false;
}

exports.getLocation = string => (string === '/' ? '/' : string.split('/').filter(file => file != ''));

exports.cleanParams = command => command.replace(' ', '');
