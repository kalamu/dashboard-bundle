$.widget( "kalamu.kalamuDashboardRow", {

    options: {
        editing: false,
        col: 1,
        cols: null,
        enable_responsive_config: false,
        responsive: null,
        dashboard: null
    },

    _create: function() {
        if(this.options.cols === null){
            this.options.cols = [];
        }
        this.element.addClass('row kalamu-dashboard-row');
        this.options.enable_responsive_config = this.options.dashboard.options.enable_responsive_config;
        if(!this.options.enable_responsive_config){
            console.log(this);
        }

        delete_link = $('<a href="#" class="btn btn-danger btn-xs" title="'+Translator.trans('element.row.delete', {}, 'kalamu')+'"><i class="fa fa-trash"></i></a>');
        linkUp = $('<a href="#" class="btn btn-default btn-xs" title="'+Translator.trans('element.row.up', {}, 'kalamu')+'"><i class="fa fa-arrow-up"></i></a>');
        linkDown = $('<a href="#" class="btn btn-default btn-xs" title="'+Translator.trans('element.row.down', {}, 'kalamu')+'"><i class="fa fa-arrow-down"></i></a>');
        this.options.addCol = $('<a href="#" class="btn btn-success btn-xs visible-editing btn-add-row" title="'+Translator.trans('element.row.add_col', {}, 'kalamu')+'"><i class="fa fa-plus"></i></a>');
        if(this.options.enable_responsive_config){
            responsiveConfig = $('<a href="#" class="btn btn-default btn-xs" title="'+Translator.trans('element.row.config', {}, 'kalamu')+'"><i class="fa fa-gear"></i></a>');
        }

        config_row = $('<div class="col-md-12 visible-editing visible-editing-row text-right">')
                .append(linkUp)
                .append(linkDown)
                .append(delete_link);
        this.element.append(config_row);
        this.element.append(this.options.addCol);

        this._on( delete_link, { click: this._delete });
        this._on( linkUp, { click: this.up });
        this._on( linkDown, { click: this.down });
        this._on( this.options.addCol, { click: this.newColumn });

        if(this.options.enable_responsive_config){
            linkDown.after(responsiveConfig);
            this._on( responsiveConfig, { click: this.configureResponsive });
        }

        this._addCols();
        this.element.find('>.kalamu-dashboard-col').eq(0).css('clear', 'both');

        this.refresh();
    },

    refresh: function(){
        if(this.options.col < 12){
            this.options.addCol.show();
        }else{
            this.options.addCol.hide();
        }
    },

    export: function(){
        var json = {
            col: this.options.col,
            cols: [],
            responsive: this.options.responsive
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

    newColumn: function(e){
        e.preventDefault();

        previousCol = this.element.find('.kalamu-dashboard-col:last');
        size = previousCol.kalamuDashboardCol('option', 'md');
        previousCol.kalamuDashboardCol('option', 'resizable', true);
        this.options.col++;
        md = Math.floor(12/this.options.col);

        col = $('<div>');
        this.element.append(col);
        col.kalamuDashboardCol({resizable: (md*this.options.col < 12) , dashboard: this.options.dashboard});

        for(x=0; x<this.options.col; x++){
            this.element.find('.kalamu-dashboard-col').eq(x).kalamuDashboardCol('option', 'md', md);
        }
        this.refresh();
    },

    configureResponsive: function(e){
        e.preventDefault();

        var responsiveConfig = $('<div>');
        responsiveConfig.appendTo('body');
        responsiveConfig.kalamuResponsiveConfig({
            datas: this.options.responsive,
            editable: ['visible', 'class', 'id']
        });
        responsiveConfig.kalamuResponsiveConfig('open');

        responsiveConfig.one('kalamu.responsive_config.change', $.proxy(function(e, datas){
            this.options.responsive = datas;
        }, this));
        responsiveConfig.one('kalamu.responsive_config.closed', function(e){ $(e.target).remove(); });
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