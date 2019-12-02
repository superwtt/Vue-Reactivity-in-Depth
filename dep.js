/**
 * @class Dep:进行订阅者的收集，通知等
 * 
 */
class Dep{
    constructor(){
        this.deps = [];
    }

    addDeps(dep){
        this.deps.push(dep);
    }

    notify(){
        this.deps.forEach(dep => dep.update());
    }
}