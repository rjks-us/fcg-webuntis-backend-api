const fs = require('fs');

const components = ["IMAGE", "NETWORKIMAGE", "BUTTON", "TEXT"] 

let layoutCollection = [];

module.exports = {
    /**
     * Loading layouts provided in the static/messages/layouts folder
     */
    loadLayouts: async () => {
        const layouts = fs.readFileSync(__dirname + '../static/messages/layouts').filter(file => file.toString().endsWith('.json'));

        layouts.forEach(layout => {
            var la = new this.Layout(layout.name, layout.description, layout.author);

            la.components.forEach(component => la.addComponent(component));
            
            layoutCollection.push(la);
        });
    },
    /**
     * Returns a layout matching the provided name
     * @param {String} name 
     * @returns Layout
     */
    getLayoutByName(name) {
        return layoutCollection.find(layout => layout.name = name);
    },
    LayoutBuilder: class LayoutBuilder {

        constructor(context) {
            this.context = context;

            const layout = getLayoutByName(context.name);

            if(layout === undefined) throw new Error('The provided layout name does not exist'); ///The layout name does not exist

            context.forEach(component => {
                layout.getComponentById(component.id)
            });
        }

    },
    Layout: class Layout {

        constructor(name, description, author) {
            this.name = name;
            this.description = description;
            this.author = author;

            this.components = [];
        }

        addComponent(component) {
            this.components.push(component);
        }

        getComponentById(id) {
            this.components.forEach(comp => {
                if(comp.id = id) {
                    return comp;
                }
            });
        }
    }
}