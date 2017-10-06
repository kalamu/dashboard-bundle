$.widget( "kalamu.kalamuDashboardCol", {

    options: {
        editing: false,
        md: null,
        widgets: null,
        enable_responsive_config: false,
        responsive: null,
        viewport: null,
        dashboard: null,
        resizable: false
    },
    _create: function() {
        this.element.addClass('col-md-'+this.options.md);
        this.element.addClass('kalamu-dashboard-col');

        this.options.explorer = this.options.dashboard.options.explorerWidget;
        this.options.enable_responsive_config = this.options.dashboard.options.enable_responsive_config;

        if(this.options.widgets){
            $.each(this.options.widgets, $.proxy(function(i, config){
                widget = $('<div>');
                this.element.append(widget);
                config.explorer = this.options.explorer;
                widget.kalamuDashboardWidget(config);
            }, this));
        }

        link = $('<a href="#" title="'+Translator.trans('add.widget.link.title', {}, 'kalamu')+'"><strong><i class="fa fa-plus"></i></strong></a>');
        link.on('click', $.proxy(this._openExplorer, this));

        if(this.options.resizable){
            this.enableResize();
        }else{
            this.disableResize();
        }

        config_btns = $('<div class="col-md-12 stick-bottom visible-editing">')
                .append(link);

        if(this.options.enable_responsive_config){
            responsiveConfig = $('<a href="#" class="btn btn-default btn-xs" title="'+Translator.trans('element.col.config', {}, 'kalamu')+'"><i class="fa fa-gear"></i></a>');
            config_btns.append(responsiveConfig);
            this._on( responsiveConfig, {click: this.configureResponsive } );
            this.configureResponsive();
        }

        this.element.append( config_btns );
    },

    refresh: function(){
        if(this.options.resizable){
            this.enableResize();
        }else{
            this.disableResize();
        }
    },

    enableResize: function(){
        if(!this.options.resizer){
            this.options.resizer = $('<div class="resizer-col visible-editing"></div>');
            this.element.prepend(this.options.resizer);
            this.options.resizer.draggable({
                axis: "x",
                start: $.proxy(this.startResize, this),
                stop: $.proxy(this.stopResize, this),
                drag: $.proxy(this.dragResize, this),
            });
        }
    },

    disableResize: function(){
        if(this.options.resizer){
            this.options.resizer.remove();
            this.options.resizer = false;
        }
    },

    startResize: function(e, ui){
        this.options.md_size = parseInt(this.element.parent().width() / 12);
        this.options.resizer.draggable("option", 'grid', [this.options.md_size, this.options.md_size]);
        if(this.element.next('.kalamu-dashboard-col').length){
            this.options.max_left = this.options.md + this.element.next('.kalamu-dashboard-col').kalamuDashboardCol('option', 'md')-1;
        }else{
            this.options.max_left = 12;
            this.element.prevAll('.kalamu-dashboard-col').each($.proxy(function(i, obj){
                this.options.max_left -= $(obj).kalamuDashboardCol('option', 'md');
            }, this));
        }
    },

    stopResize: function(e, ui){
        for(var x=1; x<=11; x++){
            if(Math.abs(ui.position.left - (x*this.options.md_size)) <= (this.options.md_size/2)){
                diff = this.options.md - x;
                this.element.removeClass('col-md-'+this.options.md);
                this.options.md = x;
                this.options.responsive.size[this.options.viewport] = x;
                this.element.addClass('col-md-'+this.options.md);
                this.options.resizer.css('left', 'auto');
                if(this.element.next('.kalamu-dashboard-col').length){
                    this.element.next('.kalamu-dashboard-col').kalamuDashboardCol('option', 'md', this.element.next().kalamuDashboardCol('option', 'md')+diff );
                }else if(x === this.options.max_left){
                    this.disableResize();
                }
                break;
            }
        }
    },

    dragResize: function(e, ui){
        ui.position.left = Math.max( this.options.md_size, ui.position.left );
        ui.position.left = Math.min( this.options.md_size*this.options.max_left, ui.position.left );
    },

    configureResponsive: function(e){
        if(e){
            e.preventDefault();
        }else{
            this.options.responsive = $('<div>').kalamuResponsiveConfig({
                    datas: this.options.responsive,
                    editable: ['visible', 'size', 'class', 'id']
                }).kalamuResponsiveConfig('option', 'datas');
            $.each(this.options.responsive.size, $.proxy(function(i, val){
                this.options.responsive.size[i] = this.options.md;
            }, this));
            return;
        }

        var responsiveConfig = $('<div>');
        responsiveConfig.appendTo('body');
        responsiveConfig.kalamuResponsiveConfig({
            datas: this.options.responsive,
            editable: ['visible', 'size', 'class', 'id']
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
            this.element.removeClass('col-md-'+this.options.md);
            this.options.md = this.options.responsive.size[viewport];
            this.element.addClass('col-md-'+this.options.md);
        }
    },

    export: function(){
        var json = {
            md: this.options.md,
            widgets: [],
            responsive: this.options.responsive
        };
        list_widget = this.element.find('.kalamu-dashboard-widget');
        for(var x=0; x<list_widget.length; x++){
            json.widgets.push( list_widget.eq(x).kalamuDashboardWidget('export') );
        }
        return json;
    },

    editElement: function(widget){
        this.options.explorer.kalamuElementExplorer('showElementInfos', widget.options.identifier, widget.options.params);

        updateElementFct = $.proxy(this.updateElement, this, widget.element);
        this.options.explorer.on('kalamu.dashboard.valid_element', updateElementFct);
        this.options.explorer.on('kalamu.dashboard.close_explorer', $.proxy(function(updateElementFct){
            this.options.explorer.off('kalamu.dashboard.valid_element', updateElementFct);
        }, this, updateElementFct));
    },

    _openExplorer: function(e){
        e.preventDefault();
        this.options.explorer.kalamuElementExplorer('showElements');

        addWidgetFct = $.proxy(this.addWidget, this);
        this.options.explorer.on('kalamu.dashboard.valid_element', addWidgetFct);
        this.options.explorer.on('kalamu.dashboard.close_explorer', $.proxy(function(addWidgetFct){
            this.options.explorer.off('kalamu.dashboard.valid_element', addWidgetFct);
        }, this, addWidgetFct));

    },

    addWidget: function(e, infos){
        widget = $('<div>');
        this.element.find('>.stick-bottom').before(widget);
        widget.kalamuDashboardWidget({
            explorer: this.options.explorer,
            context: infos.context,
            type: infos.type,
            identifier: infos.identifier,
            params: infos.params
        });

        this.options.explorer.kalamuElementExplorer('option', 'dashboard').element.trigger('kalamu.dashboard.widget_added');
    },

    updateElement: function(widget, e, infos){
        widget.kalamuDashboardWidget('option', 'context', infos.context)
            .kalamuDashboardWidget('option', 'type', infos.type)
            .kalamuDashboardWidget('option', 'identifier', infos.identifier)
            .kalamuDashboardWidget('option', 'params', infos.params)
            .kalamuDashboardWidget('refresh');
    },

    _setOption: function( key, value ) {
        if (key == 'md') {
              this.element.removeClass('col-md-'+this.options.md);
              this.element.addClass('col-md-'+value);
              this.options.responsive.size[this.options.viewport] = value;
        }

        this._super( key, value );
        this.refresh();
    }
});