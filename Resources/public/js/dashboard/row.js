$.widget( "kalamu.kalamuDashboardRow", {

    options: {
        editing: false,
        col: 1,
        cols: null,
        dashboard: null
    },

    _create: function() {
        if(this.options.cols === null){
            this.options.cols = [];
        }
        this.element.addClass('row kalamu-dashboard-row');

        delete_link = $('<a href="#" class="btn btn-danger btn-xs" title="'+Translator.trans('row.delete', {}, 'kalamu')+'"><i class="fa fa-trash"></i></a>');
        linkUp = $('<a href="#" class="btn btn-default btn-xs" title="'+Translator.trans('row.up', {}, 'kalamu')+'"><i class="fa fa-arrow-up"></i></a>');
        linkDown = $('<a href="#" class="btn btn-default btn-xs" title="'+Translator.trans('row.down', {}, 'kalamu')+'"><i class="fa fa-arrow-down"></i></a>');

        config_row = $('<div class="col-md-12 visible-editing visible-editing-row text-right">').append(linkUp).append(linkDown).append(delete_link);
        this.element.append(config_row);
        
        this._on( delete_link, { click: this._delete });
        this._on( linkUp, { click: this.up });
        this._on( linkDown, { click: this.down });

        this._addCols();
        this.element.find('>.kalamu-dashboard-col').eq(0).css('clear', 'both');
    },

    export: function(){
        var json = {
            col: this.options.col,
            cols: []
        };
        list_col = this.element.find('.kalamu-dashboard-col');
        for(var x=0; x<list_col.length; x++){
            json.cols.push( list_col.eq(x).kalamuDashboardCol('export') );
        }
        return json;
    },

    up: function(e){
        e.preventDefault();
        if(this.element.prev().not('.stick-top').length){
            this.element.prev().before( this.element.detach() );
            this.options.dashboard.element.trigger("kalamu.dashboard.move_row");
        }
    },

    down: function(e){
        e.preventDefault();
        if(this.element.next().not('.stick-bottom').length){
            this.element.next().after( this.element.detach() );
            this.options.dashboard.element.trigger("kalamu.dashboard.move_row");
        }
    },

    // Ajoute les colonnes demandées
    _addCols: function(){
        md = Math.abs(12/this.options.col);
        for(x=0; x<this.options.col; x++){
            col = $('<div>');
            this.element.append(col);
            resizable = (x+1) < this.options.col ? true : false;
            
            options = this.options.cols[x]||{md: md};
            options.resizable = resizable;
            options.dashboard = this.options.dashboard;
            
            col.kalamuDashboardCol(options);
        }
    },

    _delete: function(e){
        e.preventDefault();
        this.element.remove();
        this.options.dashboard.element.trigger("kalamu.dashboard.delete_row");
    }

});