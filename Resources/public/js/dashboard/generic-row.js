$.widget( "kalamu.kalamuDashboardGenericRow", {

    options: {
        enable_row: false,
        enable_section: false
    },

    _create: function() {
        this.element.addClass('row stick-bottom kalamu-dashboard-row kalamu-dashboard-generic-row');
        
        if(this.options.enable_row){
            links = $('<strong><i class="fa fa-plus"></i> '+Translator.trans('add.line', {}, 'kalamu')+' </strong>');
            this.element.append(links);
            types = [1, 2, 3, 4];
            for(n =0; n<types.length; n++){
                col = types[n];

                link = $('<a href="#" data-nb-col="'+col+'"> '+Translator.transChoice('n_col', col, {col: col}, 'kalamu')+'</a>')
                        .css('margin-left', '1em')
                        .appendTo(links);
                this._on( link, {'click': this._addRow} );
            }
        }
        
        if(this.options.enable_section){
            linkSection = $('<a href="#"><strong><i class="fa fa-plus"></i> '+Translator.trans('add.section', {}, 'kalamu')+' </strong></a>');
            this.element.append('<br />').append(linkSection);
            this._on( linkSection, {'click': this._addSection} );
        }
    },

    _addRow: function(e){
        e.preventDefault();
        this.element.trigger('kalamu.dashboard.add_row', $(e.currentTarget).attr('data-nb-col'));
    },
    
    _addSection: function(e){
        e.preventDefault();
        this.element.trigger('kalamu.dashboard.add_section');
    },

    _delete: function(e){
        e.preventDefault();
        this.element.remove();
    }

});