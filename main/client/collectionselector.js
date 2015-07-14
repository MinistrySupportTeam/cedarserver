var items_per_page = 10;

Template.collectionSelector.helpers({
    collectionName: function () {
        return Template.parentData().collection._name;
    },
    
    getPages: function () {
        return this.pages.get();
    },
    
    activePage: function () {
        if (parseInt(this) == Template.parentData().page.get()) return 'active';
    },
    
    filtered: function () {
        return this.collection.find(this.query.get(),
            {skip: (this.page.get() - 1) * items_per_page, limit: items_per_page, sort: this.sort}
        );
    }
});

Template.collectionSelector.onCreated(function () {
    var t = Template.currentData();
    t.filters = {};
    for (var i in t.fields) {
        t.filters[t.fields[i].field] = {
            filter: new ReactiveVar(null),
            type: t.fields[i].type
        };
    }

    t.query = new ReactiveVar({});    
    t.page = new ReactiveVar(1);
    t.pages = new ReactiveVar([]);
    
    this.autorun(function () {
        var t = Template.currentData();

        var values = {};
        for (var k in t.filters) {
            if (t.filters.hasOwnProperty(k) && t.filters[k].filter.get() != null) {
                if (t.filters[k].type == String) values[k] = t.filters[k].filter.get();
                else if (t.filters[k].type == Array) values[k] = {$in: t.filters[k].filter.get()}
            }
        }
        
        console.log(values);
        
        var p = [];
        for (var n = 1; n <= Math.ceil(t.collection.find(values).count() / items_per_page); n++) {
            p.push(n);
        }
        
        t.query.set(values);
        t.pages.set(p);
    });
});

Template.collectionSelector.events({
    'keyup .collection-filter': function (event) {
        var filter = Template.currentData().filters[$(event.target).data('filter')];
        var val = $(event.target).val();
        if (val.length > 0) {
            if (filter.type == String) filter.filter.set(new RegExp(val, 'i'))
            else if (filter.type == Array) {
                var nf = [];
                val.split(',').forEach(function (t) {nf.push(t.trim());});
                filter.filter.set(nf);
            }
        }

        else filter.filter.set(null);
    },
    
    'click .pagenum': function (event, template) {
        template.data.page.set(this);
    },
    
    'click #pageprev': function (event, template) {
        if (template.data.page.get() > 1)
            template.data.page.set(template.data.page.get() - 1);
    },
    
    'click #pagenext': function (event, template) {
        if (template.data.page.get() < template.data.pages.get().length)
            template.data.page.set(template.data.page.get() + 1);
    }
});
