class Compiler {
    constructor({ el, vm }) {
        this.el = document.querySelector(el);
        this.vm = vm;
        this.init();
    }

    init() {
        if (!this.el) throw new Error('请指定vue作用的元素!');
        let fragment = this.node2Fragment();
        this.compile(fragment);
        this.el.appendChild(fragment);
    }

    //获取当前的节点，并将整个节点以及子节点绘制到fragment
    node2Fragment() {
        let fragment = document.createDocumentFragment();
        let child;
        while (child = this.el.firstChild) {
            //appendChild具有移动性，可以把一个节点移到另一个位置
            fragment.appendChild(child);
        }
        return fragment;
    }

    //进行模板的解析
    compile(node) {
        let nodes = node.childNodes;
        Array.from(nodes).forEach(nodeItem => {
            if (this.isElement(nodeItem)) {
                let nodeAttributtes = nodeItem.attributes;
                Array.from(nodeAttributtes).forEach(attr => {
                    let dir = attr.name;
                    let exp = attr.value;
                    if (this.isDirective(dir)) {
                        this.update({ node: nodeItem, dir: dir.slice(2), exp });
                    }
                    if (this.isEvent(dir)) {
                        this.eventHandler({ vm: this.vm, node: nodeItem, dir, exp });
                    }
                })
            } else if (this.isInterpolation(nodeItem)) {
                //TODIG:这里的Regexp是全局的，相关正则知识需了解一下
                this.update({ node: nodeItem, dir: 'text', exp: RegExp.$1 });
            }
            if (nodeItem.childNodes && nodeItem.childNodes.length > 0) {
                this.compile(nodeItem);
            }
        });
    }

    //统一update的入口
    update({ node, dir, exp }) {
        let fnName = `${dir}Updater`;
        let updateFn = this[fnName];
        if (!updateFn || typeof updateFn !== 'function') {
            throw new Error('暂时无法解析该指令!');
        }
        updateFn.call(this,{ vm: this.vm, node, exp });
        new Watcher({
            vm: this.vm,
            key: exp,
            cb: () => {
                this[fnName]({ vm: this.vm, node, exp })
            }
        })
    }

    //文本的更新
    textUpdater({ vm, node, exp }) {
        node.textContent = vm[exp];
    }

    //model的更新
    modelUpdater({ vm, node, exp }) {
        node.value = vm[exp];
        node.addEventListener('input', e => {
            this.vm[exp] = e.target.value;
        });
    }

    //html元素的更新
    htmlUpdater({ vm, node, exp }) {
        node.innerHtml = vm[exp];
    }

    //事件的处理
    eventHandler({ vm, node, dir, exp }) {
        let event = dir.slice(1);
        let fn = vm.options.methods && vm.options.methods[exp];
        if (!fn || typeof fn !== 'function') throw new Error('暂无支持方法!');
        node.addEventListener(event, fn.bind(vm));
    }

    //是否是元素
    isElement(node) {
        return node.nodeType === 1;
    }

    //是否是指令
    isDirective(directive) {
        return directive.indexOf('v-') === 0;
    }

    //是否是事件
    isEvent(directive) {
        return directive.slice(0, 1) === '@';
    }

    //是否是插值
    isInterpolation(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }

}

