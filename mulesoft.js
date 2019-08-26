process.stdin.resume();
process.stdin.setEncoding("ascii");
var input = "";
console.log("Welcome to tom1mat Mulesoft's challenge!\nType command help for help")
process.stdin.on("data", function (chunk) {
    const command = chunk.replace('\r\n', '');
    let output;

    switch(command){
        case 'quit':
            process.exit();
        break;
        case 'pwd':
            output = pwd();
        break;
        case 'ls':
            output = ls();
        break
        case 'help':
            output = 'Command descriptions.\n'+
                'quit             => For closing the application. \n'+
                'pwd              => For listing the current directory. \n'+
                'ls               => For listing the contents of the current directory. \n'+
                'cd [dirName]     => For changing the current directory. \n'+
                'mkdir [dirName]  => For creating a new directory. \n'+
                'touch [fileName] => For creating a file. \n';
        break;
        default:
            if(command.includes('cd')){
                const route = cleanParams(command.split('cd')[1]);
                const res = cd(route);
                if(res && res.output){
                    output = res.output
                }
            }else if(command.includes('touch')){
                const file = cleanParams(command.split('touch')[1]);
                touch(file);
            }else if(command.includes('mkdir')){
                const dir = cleanParams(command.split('mkdir')[1]);
                mkdir(dir);
            }
        break;
    }

    if(output){
        console.log('\n');
        console.log(output);
    }
});
process.stdin.on("end", function () {
    // now we can read/parse input
});

let currentDir = '/';

const commands = ['quit', 'pwd', 'mkdir', 'cd', 'touch', 'ls'];

/*
MODELS, (Update: make classes)
    const dir = {
        type: 'dir'
        name: 'dirName',
        childs: []
    }
    const file = {
        type: 'file'
        name: 'fileName'
    }
*/

const memory = [{
    name: 'dir1',
    type: 'dir',
    childs: [
        {
            name: 'dir1.1',
            type: 'dir',
            childs: [

            ]
        },
        {
            name: 'fi1.2',
            type: 'file',
        }
    ]
}];

function pwd(){
    return currentDir;
}

function ls(){
    let files;
    if(currentDir === '/'){
        files = memory.map(child => child.type === 'dir' ? `DIR: ${child.name} \n` : `FILE: ${child.name} \n`);
    }else{
        const object = getObjectFromLocation(getLocation(currentDir))
        if(object){
            files = object.childs.map(child => child.type === 'dir' ? `DIR: ${child.name} \n` : `FILE: ${child.name} \n`);
        }else{
            return {
                status: 'error',
                message: `ERROR (cod1), the directory could not be created.`
            }; 
        }
    }

    let filesStr = '';
    for(file of files){
        filesStr+=file;
    }
    return filesStr;
}

function cd(location){
    if(location === '..'){
        if(location != '/'){
            const tree = getLocation(currentDir);
            const currentFolder = tree[tree.length - 1];
            currentDir = currentDir.replace(currentFolder,'');
        }
    }else{
        let path;
        if(location[0] === '/'){//Check if the route is absolute
            path = location;
        }else{
            path = currentDir === '/' ? currentDir+location : `${currentDir}/${location}`;
        }
        /* Could use shorhand:

            let path = location[0] === '/' ? currentDir === '/' ? location : currentDir+location : `${currentDir}/${location}`;

            but will be tidy
        */
    
        if(path === '/'){
            currentDir = '/';
            return {
                status: 'success',
                output: path,
                log: `Switched to ${path} successfully.`
            }; 
        }else{
            const object = getObjectFromLocation(getLocation(path));
            if(object){
                currentDir = path;
                return {
                    status: 'success',
                    output: path,
                    log: `Switched to ${path} successfully.`
                }; 
            }else{
                return {
                    status: 'error',
                    output: `The path ${path} does not exists.`,
                    log: `The path ${path} does not exists.`
                }; 
            }
        }
    }
}

function mkdir(name){
    const newFolder = `${currentDir}/${name}`;
    const tree = getLocation(newFolder);
    if(!objectExists(tree, 'dir')){
        const dir = {
            name,
            type: 'dir',
            childs: []
        }
        if(currentDir === '/'){
            memory.push(dir);
            return {
                status: 'success',
                message: `The directory ${name} was created successfully.`
            };
        }else{
            const object = getObjectFromLocation(getLocation(currentDir));
            if(object){
                object.childs.push(dir);
            }else{
                return {
                    status: 'error',
                    message: `ERROR (cod2), the directory could not be created.`
                };            
            }
            return {
                status: 'success',
                message: `The directory ${name} was created successfully.`
            };
        }
    }else{
        return {
            status: 'error',
            message: `The directory ${name} has already exists.`
        };
    }
}

function touch(name){
    const newFile = currentDir + name;
    const tree = getLocation(newFile);
    if(!objectExists(tree, 'file')){
        const file = {
            name,
            type: 'file'
        }
        if(currentDir === '/'){
            memory.push(file);
            return {
                status: 'success',
                message: `The file ${name} was created successfully.`
            };
        }else{
            const object = getObjectFromLocation(getLocation(currentDir));
            if(object){
                object.childs.push(file);
            }else{
                return {
                    status: 'error',
                    message: `ERROR (cod3), the file could not be created.`
                };            
            }
            return {
                status: 'success',
                message: `The file ${name} was created successfully.`
            };
        }
    }else{
        return {
            status: 'error',
            message: `The file ${name} has already exists.`
        };
    }
}

/* 
    Helper functions
*/
function getChild(name, childs){
    if(childs.length){// If is array
        for(let child of childs){
            if(child.name === name){
                return child;
            }
        }
    }

    return false;
}

/*
    Must be Recursive...
*/
function getObjectFromLocation(tree, current=0, currMemory = memory){
    const object = getChild(tree[current], currMemory);

    if(!object){// Base case 1
        return false;
    }
    if(current === tree.length-1 ){// Base case 2
        return object;
    }else{
        return getObjectFromLocation(tree, current+1, object.childs);
    }
}

function objectExists(tree, fileType='dir', current=0, currMemory = memory){
    const object = getChild(tree[current], currMemory);
    if(!object){// Base case 1
        return false;
    }
    if(tree.length === 1){
        return hasChild(tree[0], memory, fileType);
    }else if(current === tree.length - 2){// Base case 2
        //  Le pregunto al anteúltimo si tiene la carpeta.
        return hasChild(tree[tree.length-1], object.childs, fileType);
    }else{
        return objectExists(tree, current+1, object.childs);
    }
}

function hasChild(name, childs, fileType){
    for(const child of childs){
        if(fileType){
            if(child.type === fileType && child.name === name){
                return true;
            }
        }else{
            if(child.name === name){
                return true;
            }
        }
    }

    return false;
}

function existsCommand(command){
    for(const eachComm of commands){
        if(eachComm === command){
            return true;
        }
    }
    return false;
}

function getLocation(string){
    if(string === '/'){
        return '/';
    }else{
        return string.split('/').filter( file => file != '');
    }
}

function cleanParams(command){
    return command.replace(' ', '');
}