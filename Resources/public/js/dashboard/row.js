$.widget( "kalamu.kalamuDashboardRow", {

    options: {
        editing: false,
        col: 1,
        cols: null,
        enable_responsive_config: false,
        responsive: null,
        viewport: null,
        dashboard: null
    },

    _create: function() {
        if(this.options.cols === null){
            this.options.cols = [];
        }
        this.element.addClass('row kalamu-dashboard-row');
        this.options.enable_responsive_config = this.options.dashboard.options.enable_responsive_config;

        delete_link = $('<a href="#" class="btn btn-danger btn-xs" title="'+Translator.trans('element.row.delete', {}, 'kalamu')+'"><i class="fa fa-trash fa-fw"></i></a>');
        linkUp = $('<a href="#" class="btn btn-info btn-xs" title="'+Translator.trans('element.row.up', {}, 'kalamu')+'"><i class="fa fa-arrow-up fa-fw"></i></a>');
        linkDown = $('<a href="#" class="btn btn-info btn-xs" title="'+Translator.trans('element.row.down', {}, 'kalamu')+'"><i class="fa fa-arrow-down fa-fw"></i></a>');
        this.options.addCol = $('<a href="#" class="btn btn-success btn-xs visible-editing btn-add-row" title="'+Translator.trans('element.row.add_col', {}, 'kalamu')+'"><i class="fa fa-plus"></i></a>');

        btnConfig = $('<div class="collapse"></div>').uniqueId()
                .append(linkUp)
                .append(linkDown)
                .append(delete_link);
        config_row = $('<div class="row-config visible-editing visible-editing-row bg-primary">')
                .append('<a class="btn btn-xs btn-primary" role="button" data-toggle="collapse" href="#'+btnConfig.attr('id')+'" aria-expanded="false"><i class="fa fa-bars btn-fw"></i></a>')
                .append( btnConfig );
        this.element.append(config_row);
        this.element.append('<div class="row-cols"></div>');
        this.element.append(this.options.addCol);

        this._on( delete_link, { click: this._delete });
        this._on( linkUp, { click: this.up });
        this._on( linkDown, { click: this.down });
        this._on( this.options.addCol, { click: this.newColumn });

        if(this.options.enable_responsive_config){
            responsiveConfig = $('<a href="#" class="btn btn-info btn-xs btn-fw" title="'+Translator.trans('element.row.config', {}, 'kalamu')+'"><i class="fa fa-gear fa-fw"></i></a>');
            linkDown.after(responsiveConfig);
            this._on( responsiveConfig, { click: this.configureResponsive });
            if(this.options.responsive === null){
                this.configureResponsive();
            }
        }

        this._addCols();
        this.element.find('>.kalamu-dashboard-col').eq(0).css('clear', 'both');

        this.refresh();
    },

    refresh: function(){
        if(this.options.dashboard.options.editing && this.options.col < 12){
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

        this.options.col++;
        md = Math.floor(12/this.options.col);


        col = $('<div>');
        this.element.find('>.row-cols').append(col);
        col.kalamuDashboardCol({
            resizable: (md*this.options.col < 12) ,
            dashboard: this.options.dashboard,
            viewport: this.options.viewport
        });

        for(var x=0; x<this.options.col; x++){
            this.element.find('.kalamu-dashboard-col').eq(x)
                    .kalamuDashboardCol('setVisibleWidth', md)
                    .kalamuDashboardCol('setResponsiveWidth', md)
                    .kalamuDashboardCol('refresh');
        }
        this.refresh();
    },

    removeColumn: function(col){
        this.options.col--;
        if(this.options.col === 0){
            this.element.remove();
            return;
        }

        let nbLostColumn = parseInt(col.kalamuDashboardCol('getVisibleWidth'));
        col.remove();

        let lastCol = this.element.find('.kalamu-dashboard-col:last');
        lastCol.kalamuDashboardCol('setVisibleWidth', parseInt(lastCol.kalamuDashboardCol('getVisibleWidth')) + nbLostColumn );
    },

    configureResponsive: function(e){
        if(e){
            e.preventDefault();
        }else{
            this.options.responsive = $('<div>').kalamuResponsiveConfig({
                    datas: this.options.responsive,
                    editable: ['visible', 'class', 'id']
                }).kalamuResponsiveConfig('option', 'datas');
            return;
        }

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

    showView: function(viewport){
        this.options.viewport = viewport;
        if(this.options.responsive.visible.indexOf(viewport) === -1){
            this.element.hide();
        }else{
            this.element.show();
            this.element.find('>.row-cols .kalamu-dashboard-col').each(function(){
                $(this).kalamuDashboardCol('showView', viewport);
            });
        }
    },

    // Ajoute les colonnes demandées
    _addCols: function(){
        md = Math.abs(12/this.options.col);
        for(x=0; x<this.options.col; x++){
            col = $('<div>');
            this.element.find('>.row-cols').append(col);
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
    },

    _setOption: function(key, value){
        this._super( key, value );

        if(key === 'editing'){
            this.refresh();
        }
    }

});