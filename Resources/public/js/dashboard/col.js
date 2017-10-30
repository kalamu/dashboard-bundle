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

        this.element.append('<div class="col-config col-md-12 text-right bg-primary visible-editing"></div>');

        linkLeft = $('<a href="#" class="btn btn-xs btn-info"><i class="fa fa-arrow-left"></i></a>');
        linkRight = $('<a href="#" class="btn btn-xs btn-info"><i class="fa fa-arrow-right"></i></a>');
        linkDelete = $('<a href="#" class="btn btn-xs btn-danger"><i class="fa fa-trash"></i></a>');
        btnConfig = $('<div class="collapse"></div>').uniqueId()
                .append(linkLeft)
                .append(linkRight)
                .append(linkDelete);

        showConfig = $('<a role="button" data-toggle="collapse" href="#'+btnConfig.attr('id')+'" aria-expanded="false" class="btn btn-xs btn-primary"><i class="fa fa-bars"></i></a>');
        this.element.find('.col-config').append(showConfig).append(btnConfig);

        this.element.append('<div class="col-widgets col-md-12"></div>');
        if(this.options.widgets){
            $.each(this.options.widgets, $.proxy(function(i, config){
                widget = $('<div>');
                this.element.find('.col-widgets').append(widget);
                config.explorer = this.options.explorer;
                widget.kalamuDashboardWidget(config);
            }, this));
        }

        link = $('<a href="#" class="btn btn-xs btn-success btn-add-widget" title="'+Translator.trans('add.widget.link.title', {}, 'kalamu')+'"><strong><i class="fa fa-plus"></i></strong></a>');
        this.element.append( $('<div class="col-md-12 visible-editing text-center"></div>').append(link) );

        this._on(link, {click: this._openExplorer});
        this._on(linkLeft, {click: this.moveLeft});
        this._on(linkRight, {click: this.moveRight});
        this._on(linkDelete, {click: this.remove});

        if(this.options.resizable){
            this.enableResize();
        }else{
            this.disableResize();
        }

        if(this.options.enable_responsive_config){
            responsiveConfig = $('<a href="#" class="btn btn-info btn-xs" title="'+Translator.trans('element.col.config', {}, 'kalamu')+'"><i class="fa fa-gear"></i></a>');
            linkDelete.before( responsiveConfig );
            this._on( responsiveConfig, {click: this.configureResponsive } );
            this.configureResponsive();
        }

        this.refresh();
    },

    refresh: function(){
        if(this.options.enable_responsive_config && this.options.viewport){
            if(this.options.responsive.visible.indexOf(this.options.viewport) === -1){
                this.element.hide();
                return;
            }
            this.setVisibleWidth( this.options.responsive.size[this.options.viewport] );
        }

        if(this.element.next('.kalamu-dashboard-col:visible').length){
            this.options.resizable = true;
        }else{
            var sumMd = this.options.md;
            this.element.siblings('.kalamu-dashboard-col:visible').each(function(){ sumMd += $(this).kalamuDashboardCol('option', 'md'); });
            this.options.resizable = (sumMd !== 12);
        }
        if(this.options.resizable){
            this.enableResize();
        }else{
            this.disableResize();
        }
    },

    setVisibleWidth: function(width){
        this.element.removeClass('col-md-'+this.options.md);
        this.options.md = width;
        this.element.addClass('col-md-'+this.options.md);
    },

    /**
     * Define size in the specified viewport or all viewport if not specified
     * @param {type} width
     * @param {type} viewport
     * @returns {undefined}
     */
    setResponsiveWidth: function(width, viewport = null){
        if(!this.options.enable_responsive_config){
            return;
        }
        if(viewport){
            this.options.responsive.size[viewport] = width;
        }else{
            for(var x in this.options.responsive.size){
                this.options.responsive.size[x] = width;
            }
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
        if(this.element.next('.kalamu-dashboard-col:visible').length){
            this.options.max_left = this.options.md + this.element.next('.kalamu-dashboard-col:visible').kalamuDashboardCol('option', 'md')-1;
        }else{
            this.options.max_left = 12;
            this.element.prevAll('.kalamu-dashboard-col:visible').each($.proxy(function(i, obj){
                this.options.max_left -= $(obj).kalamuDashboardCol('option', 'md');
            }, this));
        }
    },

    stopResize: function(e, ui){
        for(var x=1; x<=12; x++){
            if(Math.abs(ui.position.left - (x*this.options.md_size)) <= (this.options.md_size/2)){
                diff = this.options.md - x;
                this.setVisibleWidth(x);
                if(this.options.dashboard.isResponsiveResize()){
                    this.setResponsiveWidth(x);
                }else{
                    this.setResponsiveWidth(x, this.options.viewport);
                }

                this.options.resizer.css('left', 'auto');
                var nextCol = this.element.next('.kalamu-dashboard-col:visible');
                if(nextCol.length){
                    var originalSize = nextCol.kalamuDashboardCol('option', 'md');
                    if(this.options.dashboard.isResponsiveResize()){
                        nextCol.kalamuDashboardCol('setResponsiveWidth', originalSize+diff);
                    }else{
                        nextCol.kalamuDashboardCol('setResponsiveWidth', originalSize+diff, this.options.viewport);
                    }
                    nextCol.kalamuDashboardCol('setVisibleWidth', originalSize+diff);
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
            if(!this.options.viewport){
                this.options.viewport = this.options.dashboard.options.viewport;
            }
            if(this.options.responsive === null){
                this.options.responsive = $('<div>').kalamuResponsiveConfig({
                        datas: this.options.responsive,
                        editable: ['visible', 'size', 'class', 'id']
                    }).kalamuResponsiveConfig('option', 'datas');
                $.each(this.options.responsive.size, $.proxy(function(i, val){
                    this.options.responsive.size[i] = this.options.md;
                }, this));
            }else{
                this.setVisibleWidth(this.options.responsive.size[this.options.viewport]);
            }
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
            this.refresh();
            this.element.next('.kalamu-dashboard-col').kalamuDashboardCol('refresh');
        }, this));
        responsiveConfig.one('kalamu.responsive_config.closed', function(e){ $(e.target).remove(); });
    },

    showView: function(viewport){
        this.options.viewport = viewport;
        if(this.options.responsive.visible.indexOf(viewport) === -1){
            this.element.hide();
        }else{
            this.element.show();
            this.setVisibleWidth(this.options.responsive.size[viewport]);
        }
    },

    moveLeft: function(e){
        e.preventDefault();

        var previous = this.element.prev('.kalamu-dashboard-col');
        if(previous.length){
            this.element.detach().insertBefore( previous );
            this.refresh();
            previous.kalamuDashboardCol('refresh');
        }
    },

    moveRight: function(e){
        e.preventDefault();

        var next = this.element.next('.kalamu-dashboard-col');
        if(next.length){
            this.element.detach().insertAfter( next );
            this.refresh();
            next.kalamuDashboardCol('refresh');
        }
    },

    remove: function(e){
        e.preventDefault();

        this.element.parents('.kalamu-dashboard-row').eq(0).kalamuDashboardRow('removeColumn', this.element);
        this.element.remove();
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
        this.element.find('.col-widgets').append(widget);
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
            this.setVisibleWidth(value);
        }

        this._super( key, value );
        this.refresh();
    }
});