$.widget( "kalamu.kalamuDashboardSection", {

    options: {
        dashboard: null,
        type: null,
        title: null,
        identifier: null,
        enable_responsive_config: false,
        params: null,
        responsive: null,
        rows: null
    },

    _create: function() {

        this.element.addClass('row kalamu-dashboard-section');
        this.options.enable_responsive_config = this.options.dashboard.options.enable_responsive_config;

        delete_link = $('<a href="#" class="btn btn-danger btn-xs" title="'+Translator.trans('element.section.delete', {}, 'kalamu')+'"><i class="fa fa-trash"></i></a>');
        edit_link = $('<a href="#" class="btn btn-default btn-xs" title="'+Translator.trans('element.sections.edit.link', {}, 'kalamu')+'"><i class="fa fa-edit"></i></a>');
        linkUp = $('<a href="#" class="btn btn-default btn-xs" title="'+Translator.trans('element.section.up', {}, 'kalamu')+'"><i class="fa fa-arrow-up"></i></a>');
        linkDown = $('<a href="#" class="btn btn-default btn-xs" title="'+Translator.trans('element.section.down', {}, 'kalamu')+'"><i class="fa fa-arrow-down"></i></a>');
        if(this.options.enable_responsive_config){
            responsiveConfig = $('<a href="#" class="btn btn-default btn-xs" title="'+Translator.trans('element.sections.config.link', {}, 'kalamu')+'"><i class="fa fa-gear"></i></a>');
        }

        config_row = $('<div class="col-md-12 visible-editing visible-editing-section text-right">')
                .append(linkUp)
                .append(linkDown)
                .append(edit_link)
                .append(delete_link);
        this.element.append(config_row);

        this._on( delete_link, { click: this._delete });
        this._on( edit_link, { click: this.editElement });
        this._on( linkUp, { click: this.up });
        this._on( linkDown, { click: this.down });

        if(this.options.enable_responsive_config){
            edit_link.after(responsiveConfig);
            this._on( responsiveConfig, { click: this.configureResponsive });
        }

        this.options.innerDashboard = $('<div>');
        this.element.append(this.options.innerDashboard);
        this.options.innerDashboard.kalamuDashboard({
            explorerWidget: this.options.dashboard.options.explorerWidget,
            enable_widget: true,
            enable_section: false,
            enable_responsive_config: this.options.enable_responsive_config
        });
        if(this.options._content){
            this.options.innerDashboard.kalamuDashboard('import', this.options._content);
        }

        this._updateTitle();

    },

    /**
     * Update the title of the Section
     * @returns {undefined}
     */
    _updateTitle: function(){
        this.options.dashboard.options.explorerSection.kalamuElementExplorer('loadElementInfos', this.options.identifier, this.options.params, $.proxy(function(datas){
            this.options.title = datas.title;
            this.options.edit_link.find('.section-name').text(this.options.title);
        }, this));
    },

    editElement: function(e){
        e.preventDefault();
        this.options.dashboard.options.explorerSection.kalamuElementExplorer('showElementInfos', this.options.identifier, this.options.params);

        updateElementFct = $.proxy(this.updateElement, this);
        this.options.dashboard.options.explorerSection.on('kalamu.dashboard.valid_element', updateElementFct);
        this.options.dashboard.options.explorerSection.on('kalamu.dashboard.close_explorer', $.proxy(function(updateElementFct){
            this.options.dashboard.options.explorerSection.off('kalamu.dashboard.valid_element', updateElementFct);
        }, this, updateElementFct));
    },

    updateElement: function(e, infos){
        this.options.identifier = infos.identifier;
        this.options.params = infos.params;

        this._updateTitle();
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

    export: function(){
        var json = {
            type: this.options.type,
            identifier: this.options.identifier,
            params: this.options.params,
            responsive: this.options.responsive
        };
        json._content = this.options.innerDashboard.kalamuDashboard('export');

        return json;
    },

    up: function(e){
        e.preventDefault();
        if(this.element.prev().not('.stick-top').length){
            this.element.prev().before( this.element.detach() );
            this.options.dashboard.element.trigger("kalamu.dashboard.move_section");
        }
    },

    down: function(e){
        e.preventDefault();
        if(this.element.next().not('.stick-bottom').length){
            this.element.next().after( this.element.detach() );
            this.options.dashboard.element.trigger("kalamu.dashboard.move_section");
        }
    },

    _delete: function(e){
        e.preventDefault();
        this.element.remove();
        this.options.dashboard.element.trigger("kalamu.dashboard.delete_section");
    }

});