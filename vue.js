class Vue {
    constructor(options) {
        let { data, el, created } = options;
        this.data = data;
        this.options = options;

        this.observer(this.data);

        new Compiler({ el, vm: this });

        if (created && typeof created === "function") {
            created.call(this);
        }
    }
    observer(data) {
        if (!data || !this.isObject(data)) {
            return
        }
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key])
            this.proxyData(key)
        })
    }
    defineReactive(obj, key, value) {
        this.observer(value);
        let dep = new Dep();
        Object.defineProperty(obj, key, {
            get() {
                // console.log(`get:${key}了`)
                Dep.target && dep.addDeps(Dep.target); // 加入watcher
                return value
            },
            set(newValue) {
                if (value === newValue) return
                value = newValue;

                dep.notify();
            }
        })
    }
    isObject(value) {
        return Object.prototype.toString.call(value).slice(8, -1) === 'Object';
    }

     //将this与data关联，可以通过this直接访问data的值
    proxyData(key) {
        Object.defineProperty(this, key, {
            get(){
                return this.data[key]
            },
            set(newValue){
                if(this.data[key] === newValue) return;
                this.data[key] = newValue;
            }   
        })
        console.log(this)
    }
}

// watcher的作用，就是当状态发生改变的时候，更新视图
class Watcher {
    constructor(options) {
        
        let { vm, cb, key } = options;

        this.vm = vm;
        this.cb = cb;
        this.key = key;

        // console.log(this)

        Dep.target = this;
        
        this.vm[this.key]; // 第一次进来的地方也添加成watcher

        Dep.target = null;
    }
    update(){
        this.cb();
    }

}