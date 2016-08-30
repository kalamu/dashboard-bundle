$.widget( "kalamu.kalamuDashboardGenericRow", {

    options: {
        enable_row: false,
        enable_section: false
    },

    _create: function() {
        this.element.addClass('row stick-bottom kalamu-dashboard-row kalamu-dashboard-generic-row visible-editing');

        if(this.options.enable_section){
            linkSection = $('<a href="#" class="btn btn-info">'+Translator.trans('element.generic_row.new_section.title', {}, 'kalamu')+'</a>');
            this.element.append(linkSection);
            this._on( linkSection, {'click': this._addSection} );
        }

        if(this.options.enable_row){
            types = [1, 2, 3, 4];
            group = $('<div class="btn-group" role="group"><button class="btn disabled">'+Translator.trans('element.generic_row.new_line.title', {}, 'kalamu')+'</button></div>');
            this.element.append(group);
            for(n =0; n<types.length; n++){
                col = types[n];
                link = $('<button data-nb-col="'+col+'" type="button" class="btn btn-default">'+Translator.transChoice('element.generic_row.line.add_n_col', col, {col: col}, 'kalamu')+'</button>')
                            .appendTo(group);
                this._on( link, {'click': this._addRow} );
            }
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