$.widget( "kalamu.kalamuCmsDashboard", {

    options: {
        explorerWidget: null,
        explorerSection: null,
        enable_widget: false,
        enable_section: false,
        genericRow: null
    },

    _create: function() {
        this.element.addClass('kalamu-dashboard editing');
        
        if(this.options.explorerWidget){
            this.options.explorerWidget.kalamuElementExplorer('option', 'dashboard', this);
        }
        if(this.options.explorerSection){
            this.options.explorerSection.kalamuElementExplorer('option', 'dashboard', this);
        }
        
        this._addGenericRow();

        this.addSortable();
        this.element.on('kalamu.dashboard.row_added kalamu.dashboard.section_added kalamu.dashboard.widget_added', $.proxy(function(){
            this._refresh();
        }, this));
    },
    
    _refresh: function(){
        this.removeSortable();
        this.addSortable();
        
        console.log("refresh sortable");
        
        this.element.append( this.element.find('>.stick-bottom').detach() );
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
                console.log("TODO: add section");
            }, this));
        }
    },

    /**
     * Export dashbord content to JSON
     * @returns {cms-dashboardAnonym$0.export.json}
     */
    export: function(){
        var json = { childs: [] };
        
        childs = this.element.children(':not(.kalamu-dashboard-generic-row)');
        for(var x=0; x<childs.length; x++){
            infos = {};
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
        
        this.element.children(':not(.kalamu-dashboard-generic-row)').remove();
        
        $.each(datas.childs, $.proxy(function(i, child){
            if(child.type === 'row'){
                row = $('<div>');
                this.element.append(row);
                row.kalamuDashboardRow( $.extend(child.datas, {explorer: this.options.explorerWidget}) );
            }else if(child.type === 'section'){
                section = $('<section>');
                this.element.append(section);
                row.kalamuDashboardSection( $.extend(child.datas, {explorer: this.options.explorerSection}) );
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
            stop: function(e, ui){
                dashboard = ui.item.parents('.kalamu-dashboard')
                dashboard.append( dashboard.find('>.stick-bottom').detach() );
                $(this).trigger('kalamu.dashboard.move_row');
            },
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
            stop: function(e, ui){
                col = ui.item.parents('.kalamu-dashboard-col');
                col.append( col.find('>.stick-bottom').detach() );
                ui.item.kalamuDashboardWidget('refresh');
            },
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
    }

});