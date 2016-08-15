$.widget( "kalamu.kalamuDashboardSection", {

    options: {
        dashboard: null,
        type: null,
        title: null,
        identifier: null,
        params: null,
        rows: null
    },

    _create: function() {

        this.element.addClass('row kalamu-dashboard-section');
        
        this.options.editLink = $('<a href="#" title="'+Translator.trans('section.edit.link', {}, 'kalamu')+'"><strong class="text-muted section-name"></strong></a>');
        this.element.prepend( $('<div class="section-config mb10"></div>').append(this.options.editLink) )
        this._on(this.options.editLink, { 'click': this.editElement });
        
        this.options.innerDashboard = $('<div>');
        this.element.append(this.options.innerDashboard);
        this.options.innerDashboard.kalamuCmsDashboard({
            explorerWidget: this.options.dashboard.options.explorerWidget,
            enable_widget: true,
            enable_section: false
        });
        
        this._updateTitle();
    },
    
    /**
     * Update the title of the Section
     * @returns {undefined}
     */
    _updateTitle: function(){
        this.options.dashboard.options.explorerSection.kalamuElementExplorer('loadElementInfos', this.options.identifier, this.options.params, $.proxy(function(datas){
            this.options.title = datas.title;
            this.options.editLink.find('.section-name').text(this.options.title);
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
    
    export: function(){
        var json = {
            type: this.options.type,
            identifier: this.options.identifier,
            params: this.options.params,
        };
        
        console.log(this.options.innerDashboard);

        return $.extend(this.options.innerDashboard.kalamuCmsDashboard('export'), json);
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