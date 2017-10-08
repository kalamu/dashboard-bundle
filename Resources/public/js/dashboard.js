$.widget( "kalamu.kalamuDashboard", {

    options: {
        explorerWidget: null,
        explorerSection: null,
        enable_widget: false,
        enable_section: false,
        enable_responsive_config: false,
        enable_responsive_resize: true, // resize a column in all viewport at once
        viewport: null,
        genericRow: null,
        editing: false,
        embedded: false
    },

    _create: function() {
        this.element.addClass('kalamu-dashboard');

        if(this.options.explorerWidget){
            this.options.explorerWidget.kalamuElementExplorer('option', 'dashboard', this);
        }
        if(this.options.explorerSection){
            this.options.explorerSection.kalamuElementExplorer('option', 'dashboard', this);
        }

        if(this.options.enable_responsive_config && !this.options.embedded){
            this._addViewSwitch();
            this.options.viewport = 'lg';
        }

        this._addGenericRow();

        this.addSortable();
        this.element.on('kalamu.dashboard.row_added kalamu.dashboard.section_added kalamu.dashboard.widget_added', $.proxy(function(){
            this._refresh();
        }, this));

        this._refresh();
        if(typeof this.afterCreate === 'function'){
            this.afterCreate();
        }
    },

    _refresh: function(){
        if(this.options.editing){
            this.removeSortable();
            this.addSortable();

            this.element.find('.stick-bottom').each(function(){
                parent = $(this).parent();
                parent.append( $(this).detach() );
            });
            this.element.addClass('editing');

            if(this.options.viewport){
                this.showView(this.options.viewport);
            }
        }else{
            this.removeSortable();
            this.element.removeClass('editing');
        }
    },

    isResponsiveResize: function(){
        if(this.options.embedded){
            return this.element.parents('.kalamu-dashboard').eq(0).kalamuDashboard('isResponsiveResize');
        }else{
            return this.options.enable_responsive_resize;
        }
    },

    // Ajoute la ligne générique
    _addGenericRow: function(){
        if(this.options.genericRow){
            this.options.genericRow.show();
            return;
        }

        this.options.genericRow = $('<div>');
        this.element.append( this.options.genericRow );
        this.options.genericRow.kalamuDashboardGenericRow({
            enable_row: this.options.enable_widget ? true : false,
            enable_section: this.options.enable_section ? true : false,
        });

        if(this.options.enable_widget){
            this.options.genericRow.on('kalamu.dashboard.add_row', $.proxy(function(e, nb_col){
                e.preventDefault();
                new_row = $('<div>');
                this.options.genericRow.before(new_row);
                new_row.kalamuDashboardRow({col: nb_col, dashboard: this});
                this.element.trigger('kalamu.dashboard.row_added');
            }, this));
        }

        if(this.options.enable_section){
            this.options.genericRow.on('kalamu.dashboard.add_section', $.proxy(function(e){
                e.preventDefault();

                this.options.explorerSection.kalamuElementExplorer('showElements');

                addSectionFct = $.proxy(this._addSection, this);
                this.options.explorerSection.on('kalamu.dashboard.valid_element', addSectionFct);
                this.options.explorerSection.on('kalamu.dashboard.close_explorer', $.proxy(function(addSectionFct){
                    this.options.explorerSection.off('kalamu.dashboard.valid_element', addSectionFct);
                }, this, addSectionFct));
            }, this));
        }
    },

    _addViewSwitch: function(){
        var views = {
            lg: {title: Translator.trans('responsive_config.large', {}, 'kalamu'), icon: 'fa fa-desktop'},
            md: {title: Translator.trans('responsive_config.medium', {}, 'kalamu'), icon: 'fa fa-tablet'},
            sm: {title: Translator.trans('responsive_config.small', {}, 'kalamu'), icon: 'fa fa-mobile fa-rotate-90'},
            xs: {title: Translator.trans('responsive_config.extra-small', {}, 'kalamu'), icon: 'fa fa-mobile'},
        };

        var switcher = $('<div class="btn-group" role="group" aria-label="Switch view"></div>');
        var piner = $('<div class="btn-group" role="group" aria-label="Active responsive resize"></div>');
        this.element.prepend('<section class="row visible-editing kalamu-dashboard-viewport-switch stick-top"><div class="col-md-12"><div class="pull-right"></div></div></section>');
        this.element.find('.kalamu-dashboard-viewport-switch .pull-right')
                .append(piner)
                .append( switcher );

        $.each(views, $.proxy(function(size, conf){
            var btn = $('<a href="#" class="btn btn-info btn-sm" data-viewport="'+size+'" title="'+conf.title+'"><i class="'+conf.icon+'"></i></a>');
            switcher.append(btn);
            this._on( btn, {click: this.showView} );
        }, this));

        var pinBtn = $('<button class="btn btn-sm btn-info btn-responsive-resize"><i class="fa fa-thumb-tack"></i></button>');
        piner.append( pinBtn );
        this._on( pinBtn, {click: this.activeResponsivePin } );
        if(this.options.enable_responsive_resize){
            pinBtn.addClass('active');
        }
    },

    showView: function(e){
        if(typeof e === 'string'){
            this.options.viewport = e;
        }else{
            e.preventDefault();
            this.options.viewport = $(e.currentTarget).data('viewport');
        }

        this.element.find('.kalamu-dashboard-viewport-switch a').removeClass('active').filter('[data-viewport="'+this.options.viewport+'"]').addClass('active');
        this.element.find('.kalamu-dashboard-row:not(.kalamu-dashboard-generic-row)').each($.proxy(function(i, obj){
            $(obj).kalamuDashboardRow('showView', this.options.viewport);
        }, this));
        this.element.find('.kalamu-dashboard-section').each($.proxy(function(i, obj){
            $(obj).kalamuDashboardSection('showView', this.options.viewport);
        }, this));
    },

    activeResponsivePin: function(e){
        e.preventDefault();

        this.options.enable_responsive_resize = !this.options.enable_responsive_resize;
        this.element.find('.kalamu-dashboard-viewport-switch .btn-responsive-resize').toggleClass('active');
    },

    _addSection: function(e, infos){
        section = $('<section>');
        this.element.find('>.stick-bottom').before(section);
        section.kalamuDashboardSection({
            dashboard: this,
            type: infos.type,
            identifier: infos.identifier,
            params: infos.params
        });

        this.element.trigger('kalamu.dashboard.section_added');
    },

    /**
     * Export dashbord content to JSON
     * @returns {cms-dashboardAnonym$0.export.json}
     */
    export: function(){
        var json = { childs: [] };

        var childs = this.element.children(':not(.kalamu-dashboard-generic-row)');
        for(var x=0; x<childs.length; x++){
            var infos = {};
            if(childs.eq(x).hasClass('kalamu-dashboard-row')){
                infos = {type: 'row', datas: childs.eq(x).kalamuDashboardRow('export') };
            } else if (childs.eq(x).hasClass('kalamu-dashboard-section')){
                infos = {type: 'section', datas: childs.eq(x).kalamuDashboardSection('export') };
            }

            json.childs.push( infos );
        }

        return json;
    },

    /**
     * Import dashboard content from JSON
     * @param {type} datas
     * @returns {undefined}
     */
    import: function(datas){

        this.element.children(':not(.kalamu-dashboard-generic-row,.kalamu-dashboard-viewport-switch)').remove();

        $.each(datas.childs, $.proxy(function(i, child){
            if(child.type === 'row'){
                row = $('<div>');
                this.element.append(row);
                row.kalamuDashboardRow( $.extend(child.datas, {dashboard: this}) );
            }else if(child.type === 'section'){
                section = $('<section>');
                this.element.append(section);
                section.kalamuDashboardSection( $.extend(child.datas, {dashboard: this}) );
            }
        }, this));

        this._refresh();
    },

    addSortable: function(){

        // sortable pour les lignes
        this.element.sortable({
            items: '.kalamu-dashboard-row:not(.kalamu-dashboard-generic-row), .kalamu-dashboard-section',
            tolerance: 'pointer',
            placeholder: "ui-state-highlight col-md-12",
            opacity: 0.5,
            stop: $.proxy(function(e, ui){
                this.element.append( this.element.find('>.stick-bottom').detach() );
                this.element.trigger('kalamu.dashboard.move_row');
            }, this),
            sort: function(event, ui) {
                window_position = $(window).scrollTop();
                window_height = $(window).height();
                position_relative = event.pageY-window_position;

                if(position_relative < 150 || (window_height - position_relative) < 150){
                    var topPosition = window_position - (position_relative < 150 ? 30: -30 );
                    setTimeout(function(){
                        $(window).scrollTop(topPosition);
                    }, 10);
                }
            }

        });

        // sortable pour les Widgets
        this.element.find('.kalamu-dashboard-col').sortable({
            connectWith: ".kalamu-dashboard-col",
            tolerance: 'pointer',
            items: '.kalamu-dashboard-widget',
            placeholder: "ui-state-highlight col-md-12",
            opacity: 0.5,
            stop: $.proxy(function(e, ui){
                col = ui.item.parents('.kalamu-dashboard-col');
                col.append( col.find('>.stick-bottom').detach() );
                ui.item.kalamuDashboardWidget('refresh');
                this.element.trigger('kalamu.dashboard.move_widget');
            }, this),
            sort: function(event, ui) {
                window_position = $(window).scrollTop();
                window_height = $(window).height();
                position_relative = event.pageY-window_position;

                if(position_relative < 150 || (window_height - position_relative) < 150){
                    var topPosition = window_position - (position_relative < 150 ? 30: -30 );
                    setTimeout(function(){
                        $(window).scrollTop(topPosition);
                    }, 10);
                }
            }
        });

        $(".kalamu-dashboard-col, .kalamu-dashboard-row").disableSelection();

    },

    removeSortable: function(){
        if(this.element.hasClass('ui-sortable')){
            this.element.sortable('destroy');
        }
        this.element.find('.kalamu-dashboard-col.ui-sortable').sortable('destroy');

        $(".kalamu-dashboard-col").enableSelection();
        $(".kalamu-dashboard-row").enableSelection();
    },

    _setOption: function(key, value){
        this._super( key, value );

        if(key === 'editing'){
            this._refresh();
        }
    }

});