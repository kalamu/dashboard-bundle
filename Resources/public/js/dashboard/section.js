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
        this.options.enable_responsive_config = this.options.dashboard.options.enable_responsive_config;

        this.options.header = $('<div class="panel-heading" role="tab"><h4 class="panel-title"><a role="button" data-toggle="collapse" aria-expanded="true" class="section-name"></a></h4></div>');
        this.options.body = $('<div class="collapse panel-collapse in" role="tabpanel"><div class="panel-config"></div><div class="panel-body"></div></div>');
        this.options.body.uniqueId();
        this.options.header.find('a').attr('href', '#'+this.options.body.attr('id')).attr('ria-controls', this.options.body.attr('id'));

        $('<div class="panel panel-primary">')
                .append(this.options.header)
                .append(this.options.body)
                .appendTo(this.element);

        delete_link = $('<a href="#" class="btn btn-danger btn-sm" title="'+Translator.trans('element.section.delete', {}, 'kalamu')+'"><i class="fa fa-trash"></i></a>');
        edit_link = $('<a href="#" class="btn btn-info btn-sm" title="'+Translator.trans('element.sections.edit.link', {}, 'kalamu')+'"><i class="fa fa-edit"></i></a>');
        linkUp = $('<a href="#" class="btn btn-info btn-sm" title="'+Translator.trans('element.section.up', {}, 'kalamu')+'"><i class="fa fa-arrow-up"></i></a>');
        linkDown = $('<a href="#" class="btn btn-info btn-sm" title="'+Translator.trans('element.section.down', {}, 'kalamu')+'"><i class="fa fa-arrow-down"></i></a>');

        config_row = $('<div class="btn-group text-right">')
                .append(linkUp)
                .append(linkDown)
                .append(edit_link)
                .append(delete_link);
        this.options.body.find('.panel-config').append(config_row);

        this._on( delete_link, { click: this._delete });
        this._on( edit_link, { click: this.editElement });
        this._on( linkUp, { click: this.up });
        this._on( linkDown, { click: this.down });

        if(this.options.enable_responsive_config){
            responsiveConfig = $('<a href="#" class="btn btn-info btn-sm" title="'+Translator.trans('element.sections.config.link', {}, 'kalamu')+'"><i class="fa fa-gear"></i></a>');
            edit_link.after(responsiveConfig);
            this._on( responsiveConfig, { click: this.configureResponsive });
            if(this.options.responsive === null){
                this.configureResponsive();
            }
        }

        this.options.innerDashboard = $('<div>');
        this.options.body.find('.panel-body').append(this.options.innerDashboard);
        this.options.innerDashboard.kalamuDashboard({
            explorerWidget: this.options.dashboard.options.explorerWidget,
            enable_widget: true,
            enable_section: false,
            enable_responsive_config: this.options.enable_responsive_config,
            embedded: true,
            viewport: this.options.dashboard.options.viewport
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
            this.options.header.find('.section-name').text(this.options.title);
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
        if(this.options.responsive.visible.indexOf(viewport) === -1){
            this.element.hide();
        }else{
            this.element.show();
            this.element.find('>.kalamu-dashboard').kalamuDashboard('showView', viewport);
        }
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