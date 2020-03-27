$.widget( "kalamu.kalamuDashboardWidget", {

    options: {
        explorer: null,
        context: null,
        type: null,
        identifier: null,
        params: null
    },
    _create: function() {
        this.element.addClass('kalamu-dashboard-widget');
        this.refresh();
    },

    refresh: function(){
        this.options.params.push({name: 'parent_md_size', value: this.element.parents('.kalamu-dashboard-col').kalamuDashboardCol('option', 'md')});

        this.element.text('');
        editLink = $('<a href="#" class="btn btn-info btn-xs"><i class="fa fa-edit"></i> <span class="link-label">Modifier</span></a>');
        delete_link = $('<a href="#" class="btn btn-danger btn-xs"><i class="fa fa-trash"></i> <span class="link-label">supprimer le widget</span></a>');

        this.element.prepend( $('<div class="col-md-12 text-right delete_widget_link visible-editing visible-editing-widget">').append(editLink).append(delete_link) );

        this._on( editLink, { click: this.edit });
        this._on( delete_link, { click: this._delete });

        element_api = this.options.explorer.kalamuElementExplorer('option', 'element_api');

        $.ajax({
            url: element_api+this.options.context+'/'+this.options.type+'/'+this.options.identifier,
            data: this.options.params,
            method: 'GET',
            dataType: 'json',
            context: this,
            success: function(datas){
                if(datas.content){
                    this.element.append( $('<div>').append(datas.content) );
                }else if(datas.error){
                    this.element.append('<div class="alert alert-danger">'+datas.error+'</div>');
                }
            },
            error: function(){
                this.element.append('<div class="alert alert-danger">'+Translator.trans('unknown.error', {}, 'kalamu')+'</div>');
            }
        });
    },

    export: function(){
        return {
            context: this.options.context,
            type: this.options.type,
            identifier: this.options.identifier,
            params: this.options.params
        };
    },

    edit: function(e){
        e.preventDefault();

        this.element.parents('.kalamu-dashboard-col').kalamuDashboardCol('editElement', this);
    },

    _delete: function(e){
        e.preventDefault();

        dashboard = this.options.explorer.kalamuElementExplorer('option', 'dashboard').element;
        this.element.remove();
        dashboard.trigger('kalamu.dashboard.widget_added');
    }

});