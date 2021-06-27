var baseUrl = window.location.protocol + "//" + window.location.host;
var configArray = [];
var champsArray = [];
var extraArray = [];
var filtersArray = [];
var $animation = $('<i class="text-brand fas animation fa-spinner fa-spin ml-2"></i>');
var $terminated = $('<i class="text-success terminated fas fa-check ml-2"></i>');

/* var t = KTUtil.isRTL() ? {
        leftArrow: '<i class="la la-angle-right"></i>',
        rightArrow: '<i class="la la-angle-left"></i>'
    } : {
        leftArrow: '<i class="la la-angle-left"></i>',
        rightArrow: '<i class="la la-angle-right"></i>'
    }; 
*/

jQuery(document).ready(function() {
    // List
    $('.datatable-list').each(function() {
        // Params
        var titre = $(this).data("titre");
        var code = $(this).data("code");
        var sql = $(this).data("sql");
        configArray[code] = $(this).data("config");
        champsArray[code] = $(this).data("champs");
        extraArray[code] = $(this).data("extrafields");

        getTable(sql, titre, code);
    });
});

// Table name
function getTable(sqlData, titre, code) {
    Pace.track(function(){
        $.ajax({
            method: "POST",
            url: '../../api/datatable/table',
            data: {
                sql: sqlData,
            }
        })
            .done(function( data ) {
                getColumns(sqlData, data, titre, code);
                return data;
        });
    });
}

// Columns and data type
function getColumns(sqlData, entityData, titre, code) {
    Pace.track(function(){
        $.ajax({
            method: "POST",
            url: '../../api/datatable/columns',
            data: {
                sql: sqlData,
                entity: entityData
            }
        })
            .done(function( data ) {
                // Tags
                for (var column in extraArray[code]) {
                    data[column] = "extrafield";
                }
                
                setTableHeaders(data, code);
                setTitle(titre, code);

                if (data) {
                    addToolsButton(code);
                    addArchiveButton(code);
                }
                
                // New
                if (
                    code in configArray && "new" in configArray[code] && configArray[code]['new']
                ) {
                    addNewButton(entityData, code);
                }  
                
                initTable(data, sqlData, entityData, code);
                return data;
        });
    });
}

// Filtres enregistrés
function getFilters(code) {
    $.ajax({
        method: "GET",
        url: '../../api/filtre/user/list/' + code,
    })
        .done(function(data) {
            return data;
    });
}

// Title from table
function setTitle(titre, code) {
    if ($('#' + code + ' h3.list-container-title').length > 0) {
        $('#' + code + ' h3.list-container-title').text(titre);
    } else {
        $('#page-title').text(titre);
    }
    
}

// New button
function addNewButton(entityData, code) {
    var newUrl = baseUrl + "/new_" + entityData + "/";
    var $newButton = $('<a href="' + newUrl +'" class="btn-shadow ml-1 mr-1 btn btn-dark">'
            + '<i class="fas fa-plus"></i>'
        + '</a>');
    
    if ($('#' + code + ' .list-container-actions').length > 0) {
        $newButton.appendTo($('#' + code + ' .list-container-actions'));
    } else {
        $newButton.appendTo($('.page-title-actions'));
    }
}

// Archive button
function addArchiveButton(code) {
    var $actionMenu = $('<div class="d-inline-block dropdown" id="actions--dropdowns--button">'
            + '<button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="btn-shadow dropdown-toggle ml-1 mr-1 btn btn-dark">'
                + '<span class="btn-icon-wrapper pr-2 opacity-7"><i class="fa fa-business-time fa-w-20"></i></span>Action(s)'
            + '</button>'
            + '<div tabindex="-1" role="menu" aria-hidden="true" class="dropdown-menu dropdown-menu-right">'
                + '<ul class="nav flex-column">'
                    + '<li class="nav-item">'
                    + '</li>'
                + '</ul>'
            + '</div>'
        + '</div>'
    );

    // New
    if (
        code in configArray && "delete" in configArray[code] && configArray[code]['delete']
    ) {
        var $archiveButton = $('<a href="javascript:void(0);" class="nav-link">'
                + '<i class="nav-link-icon fas fa-archive"></i>'
                + '<span class="nav-link-text">Archiver</span>'
            + '</a>'
        );

        $archiveButton.appendTo($actionMenu.find('.nav-item').first())
        .on('click', function(e) {
            // Selected
            $selectedRows = $('#' + code + ' tr.selected');

            // Ajax
            Pace.track(function(){
                $selectedRows.each(function( index, value ) {
                    var deleteUrl = $(this).find('.delete--link').attr('href');
                    $.ajax({
                        method: "GET",
                        data: { ajax: true },
                        url: deleteUrl,
                    })
                        .done(function( data ) {
                            // Done
                    });
                });
            });

            $(document).ajaxComplete(function (){
                location.reload(); 
            });
        });
    } 
    
    if ($('#' + code + ' .list-container-actions').length > 0) {
        $actionMenu.appendTo($('#' + code + ' .list-container-actions'));
    } else {
        $actionMenu.appendTo($('.page-title-actions'));
    }
}

// Tools button
function addToolsButton(code) {
    var $newButton = $(
        '<div class="d-inline-block dropdown" id="tools--dropdowns--button">'
            + '<button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="btn-shadow dropdown-toggle ml-1 mr-1 btn btn-dark">'
                + '<span class="btn-icon-wrapper pr-2 opacity-7"><i class="fas fa-tools fa-w-20"></i></span>Outil(s)'
            + '</button>'
            + '<div class="dropdown-menu dropdown-menu-right">'
                + '<ul class="nav flex-column">'
                    + '<li class="nav-item">'
                        + '<a href="javascript:void(0);" class="nav-link" id="export_print">'
                            + '<i class="nav-link-icon fas fa-print"></i>'
                            + '<span class="nav-link-text">Impression</span>'
                        + '</a>'
                    + '</li>'
                    + '<li class="nav-item">'
                        + '<a href="javascript:void(0);" class="nav-link" id="export_copy">'
                            + '<i class="nav-link-icon far fa-copy"></i>'
                            + '<span class="nav-link-text">Copier</span>'
                        + '</a>'
                    + '</li>'
                    + '<li class="nav-item">'
                        + '<a href="javascript:void(0);" class="nav-link" id="export_excel">'
                            + '<i class="nav-link-icon fas fa-file-excel"></i>'
                            + '<span class="nav-link-text">Excel</span>'
                        + '</a>'
                    + '</li>'
                    + '<li class="nav-item">'
                        + '<a href="javascript:void(0);" class="nav-link" id="export_csv">'
                            + '<i class="nav-link-icon fas fa-file-csv"></i>'
                            + '<span class="nav-link-text">CSV</span>'
                        + '</a>'
                    + '</li>'
                    + '<li class="nav-item">'
                        + '<a href="javascript:void(0);" class="nav-link" id="export_pdf">'
                            + '<i class="nav-link-icon far fa-file-pdf"></i>'
                            + '<span class="nav-link-text">PDF</span>'
                        + '</a>'
                    + '</li>'
                + '</ul>'
            + '</div>'
        + '</div>'
    );

    if ($('#' + code + ' .list-container-actions').length > 0) {
        $newButton.appendTo($('#' + code + ' .list-container-actions'));
    } else {
        $newButton.appendTo($('.page-title-actions'));
    }
}

// Reset button
function addResetButton($table, code) {
    var $resetButton = $('<button title="Annuler les filtres & recherches" class="btn-shadow ml-1 mr-1 btn btn-primary" id="list-reset">'
        + '<i class="fas fa-redo"></i>&nbsp;Filtre(s)'
        + '</button>');

    $resetButton.appendTo($('#' + code + ' .dataTables_filter label'))
    .on('click', function(e) {
        // Reset recherche par champ
        $('.list-input').each(function() {
            $(this).val('');
        });

        // Reset param search par champ Datatables
        $table.DataTable().columns().every( function ( colIdx ) {
            this.search('');
        });

        // Reset recherche globale
        $('.dataTables_filter input').val('');
        $table.DataTable().search("", false).draw();
    });
}

// Advanced search button
function addAdvancedSearchButton(code) {
    var $advancedButton = $('<button title="Afficher les filtres de recherche avancés" class="btn-shadow ml-1 mr-1 btn btn-primary" id="list-reset">'
        + '<i class="fab fa-searchengin"></i>&nbsp;Recherche avancée'
        + '</button>');

    $advancedButton.appendTo($('#' + code + ' .dataTables_filter label'))
    .on('click', function(e) {
        var $searchContainer = $('#' + code + ' .list-container-customsearch');
        $searchContainer.toggle( "explode" );
    });
}

// View all button
function addViewAllButton($table, code) {
    var $viewAllButton = $('<button class="btn-shadow ml-1 mr-1 btn btn-primary" id="list-view-all" data-pagination="false">'
        + '<i class="fas fa-list"></i>&nbsp;Tout voir'
        + '</button>');
    
    $viewAllButton.appendTo($('#' + code + ' .dataTables_filter label'))
    .on('click', function(e) {
        var pagination = $(this).data("pagination");
        $(this).data("pagination", !pagination);
        $(this).toggleClass("btn-primary").toggleClass("btn-secondary");
        
        if (!pagination) {
            $table.DataTable().page.len( -1 ).draw();
        } else {
            $table.DataTable().page.len( 10 ).draw();
        }
        
    });
}

// Table headers from columns
function setTableHeaders(columns, code) {
    $tableHeader = $('#' + code + ' .table-select-header');
    for (var column in columns) {
        var thead = "<th>" + columns[column] + "</th>";
        $tableHeader.after(thead);
    }
}

// Datatable
function initTable(columns, sqlData, entityData, code) {
    // Params
    var $table = $('#' + code + ' .datatable-list');
    var $searchContainer = $('#' + code + ' .list-container-customsearch');
    var columnsArray = [];
    var relationArray = [];
    var intArray = [];
    var tinyintArray = [];
    var datetimeArray = [];
    var extrafieldArray = [];
    var extrafieldsData = extraArray[code];

    $searchContainer.hide();

    columnsArray.push({ data: null, defaultContent: '', className: 'select-checkbox', orderable: false });
    for (var columnData in columns) {
        // Visibilité
        visibleData = true;

        if (code in filtersArray && columnData in filtersArray[code]) {
            visibleData = filtersArray[code][columnData];

            if (visibleData == "1") {
                visibleData = true;
            } else if (visibleData == "0") {
                visibleData = false;
            }

        } else if (code in champsArray && columnData in champsArray[code] && "affichage" in champsArray[code][columnData]) {
            visibleData = champsArray[code][columnData]['affichage'];
        }
        
        var pushIdx = columnsArray.push({ data: columnData, className: columns[columnData] + " " + columnData, visible: visibleData, title: columnData });
        if  (columns[columnData] == "relation") {
            relationArray.push(pushIdx - 1);
        }
        if  (columns[columnData] == "int") {
            intArray.push(pushIdx - 1);
        }
        if  (columns[columnData] == "tinyint") {
            tinyintArray.push(pushIdx - 1);
        }
        if  (columns[columnData] == "datetime") {
            datetimeArray.push(pushIdx - 1);
        }
        if  (columns[columnData] == "extrafield") {
            extrafieldArray.push(pushIdx - 1);
        }
    }

    columnsArray.push({ data: "Actions", className: "actions", title: "Actions",  responsivePriority: -1 });

    // Table
    $table.DataTable({
        autoFill: false,
        responsive: true,
        searchDelay: 500,
        lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
        processing: false,
        serverSide: true,
        language: {
            "lengthMenu": "Afficher _MENU_ éléments par page",
            "zeroRecords": "Aucune donnée trouvée",
            "info": "Page _PAGE_ sur _PAGES_",
            "infoEmpty": "Aucune information",
            "infoFiltered": "(filtrage sur un total de _MAX_ éléments)",
            "search": '<i class="fas fa-search"></i>',
            "paginate": {
                "previous": '<i class="fas fa-angle-left"></i>',
                "next": '<i class="fas fa-angle-right"></i>',
              }
        },
        ajax: {
            url: '../../api/datatable/data',
            type: "POST",
            data: {
                sql: sqlData,
                entity: entityData,
                extrafields: extrafieldsData
            }
        },
        columns: columnsArray,

        initComplete: function() {
            var api = this.api();
            
            api.columns().every( function ( colIdx ) {
                var column = this;
                // Filtre
                if (
                    code in champsArray 
                    && column.dataSrc() in champsArray[code] 
                    && "filtre" in champsArray[code][column.dataSrc()]
                    && champsArray[code][column.dataSrc()]['filtre']
                ) {
            
                    if (columns[column.dataSrc()] == "varchar" || columns[column.dataSrc()] == "datetime" || columns[column.dataSrc()] == "relation" || columns[column.dataSrc()] == "tinyint" || columns[column.dataSrc()] == "int") {
                        dateRangeId = false; 
                        
                        if (columns[column.dataSrc()] == "varchar" ) {
                            // Text
                            var $input = $('<input type="text" class="form-control list-input" placeholder=" ">');
                        } else if (columns[column.dataSrc()] == "datetime") {
                            // DateRange
                            var $input1 = $('<input type="text" class="form-control list-input start-date" name="start" placeholder="">');
                            var $input2 = $('<input type="text" class="form-control list-input end-date" name="end" placeholder="">');
                            var $append = $('<div class="input-group-append"><span class="input-group-text"><i class="la la-ellipsis-h"></i></span></div>');
                            var $input = $('<div class="input-daterange input-group" id="list-datepicker_' + column.dataSrc() + '" data-target="' + column.dataSrc() + '"></div>');

                            $input1.appendTo(
                                $input
                            );
                            $append.appendTo(
                                $input
                            );
                            $input2.appendTo(
                                $input
                            );

                            var dateRangeId = '#list-datepicker_' + column.dataSrc();

                        } else if (columns[column.dataSrc()] == "relation") {
                            // Liste
                            var $input = $('<select class="form-control list-input"><option value=""></option></select>');
                            
                            column.data().sort().unique().each(function(d, j) {
                                var value = d != null ? d : '';
                                $input.append('<option value="' + d + '">' + value + '</option>');
                            });
                        } else if (columns[column.dataSrc()] == "tinyint") {
                            // Liste
                            var $input = $('<select class="form-control list-input"><option  value=""></option></select>');
        
                            $input.append('<option value="0">Non</option>');
                            $input.append('<option value="1">Oui</option>');
                            
                        } else if (columns[column.dataSrc()] == "int") {
                            // Integer
                            var $input = $('<input type="number" class="form-control list-input" placeholder=" ">');
                        }

                        var $label = $('<label>' + column.dataSrc() + '</label>');
                        var $searchDiv = $('<div class="col-lg-3"></div>');
                        $label.appendTo(
                            $searchDiv
                        );

                        $input.appendTo(
                            $searchDiv
                        ).on( 'change', function () {
                            api
                                .column( colIdx )
                                .search( $(this).val() )
                                .draw();
                        });
                        
                        $searchDiv.appendTo(
                            $searchContainer
                        );

                        if (dateRangeId) {
                            $(dateRangeId).datepicker({
                                rtl: KTUtil.isRTL(),
                                todayHighlight: !0,
                                templates: t,
                                format: {
                                    toDisplay: function (date, format, language) {
                                        var d = new Date(date);
                                        return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
                                    },
                                    toValue: function (date, format, language) {
                                        return date;
                                    }
                                }
                            }).on("changeDate", function(e) {
                                var data = $(this).data('target');
                                /*
                                var start = new Date($(this).find(".start-date").val());
                                var startDate = start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate();
        
                                var end = new Date($(this).find(".end-date").val());
                                if (end.getDate() == start.getDate()) {
                                    var endGetDate = end.getDate() + 1;
                                } else {
                                    var endGetDate =  end.getDate();
                                }
                                
                                var endDate = end.getFullYear() + "-" + (end.getMonth() + 1) + "-" +  endGetDate
                                */
                                var startDate = $(this).find(".start-date").val();
                                // var start = new Date(startDate);
                                // $(this).find(".start-date").val(start.getDate() + "/" + (start.getMonth() + 1) + "/" + start.getFullYear());
                                var endDate = $(this).find(".end-date").val();
                                // var end = new Date(endDate);
                                // $(this).find(".end-date").val(end.getDate() + "/" + (end.getMonth() + 1) + "/" + end.getFullYear());

                                if (startDate != endDate) {
                                    var regex = entityData + "." + data + " >= '" + startDate + "' AND  " + entityData + "." + data + " <= '" + endDate + "' ";
                                    $table.DataTable().search("", regex).draw();
                                    
                                    
                                }
                                
                            });
                        }
                        
                    }
                }
            } );

            // Listeners
            if (
                code in configArray && "inline" in configArray[code] && configArray[code]['inline']
            ) {
                listenTdClick(entityData, code);
            }

            // Recherches
            var $wrapper = $('#' + code + ' .dataTables_wrapper');

            $wrapper.find('.row').first().after($searchContainer);
            
            // Traduction
            setTraductions(code);

            // Table Actions
            if ($('#' + code + ' .action--div').last().find('a').length == 0) {
                $('#' + code + ' .action--div').parents('td').remove();
                $('#' + code + ' th:contains("Actions")').remove();
            }
        },

        columnDefs: [
            {
                targets: -1,
                title: 'Actions',
                orderable: false,
                render: function(data, type, full, meta) {
                    var editUrl = baseUrl + "/edit_" + entityData + "/" + full['id'];
                    var deleteUrl = baseUrl + "/delete_" + entityData + "/" + full['id'];

                    // Edit
                    if (
                        code in configArray && "edit" in configArray[code] && configArray[code]['edit']
                    ) {
                        var editLink = '<a href="' + editUrl + '" class="btn btn-sm btn-clean btn-icon btn-icon-md edit--link" title="View">'
                        + '<i class="la la-edit"></i>&nbsp;Modifier'
                        + '</a>';
                    } else {
                        var editLink = "";
                    }
                    
                    // Delete
                    if (
                        code in configArray && "delete" in configArray[code] && configArray[code]['delete']
                    ) {
                        var deleteLink = '<a href="' + deleteUrl + '" class="btn btn-sm btn-clean btn-icon btn-icon-md delete--link" title="View">'
                        + '<i class="la la-leaf"></i>&nbsp;Archiver'
                        + '</a>';
                    } else {
                        var deleteLink = "";
                    }
                    
                    var actions =  "<div class='action--div' data-id='"+ full['id'] + "'>"
                        + editLink
                        + deleteLink
                        + '</div>';
                    
                return actions; 
                },
            },
            {
                targets: datetimeArray,
                render: function(data, type, full, meta) {
                    
                    if (data == null) {
                        dataToShow = "";
                    } else {
                        var date = new Date(data);
                        var formattedDate =  date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
                        dataToShow = '<i class="la la-calendar-o"></i>&nbsp;' + formattedDate;
                    }
                    return '<span class="badge badge--inline badge--pill">' + dataToShow + '</span>';
                },
            }, 
            {
                targets: relationArray,
                render: function(data, type, full, meta) {
                    return data != null ? '<span class="badge badge--custom badge--inline badge--pill">' + data + '</span>' : '';
                },
            },
            {
                targets: extrafieldArray,
                render: function(data, type, full, meta) {
                    var $container = $('<div></div>');
                    for (var element in data) {
                        var subData = data[element];
                        for (var subElement in subData) {
                            var $span = subData[subElement] != null ? '<span class="badge badge--custom badge--inline badge--pill mr-1">' + subData[subElement] + '</span>' : '';
                            $container.append($span);
                        }
                    }
                    return $container.html();
                },
            },
            {
                targets: tinyintArray,
                render: function(data, type, full, meta) {
                    var status = {
                        0: {'title': 'Off', 'state': 'warning'},
                        1: {'title': 'On', 'state': 'success'},
                    };

                    if (typeof status[data] === 'undefined') {
                        return data;
                    }

                    var checked = data == 1 ? " checked " : "";
                    return '<input class="bootstrap-toggle" type="checkbox" ' + checked + ' data-toggle="toggle" data-style="ios" data-onstyle="success" data-offstyle="warning" data-width="10" data-height="5">';
                    return '<span class="badge badge--' + status[data].state + ' badge--dot"></span>&nbsp;' +
                        '<span class="font-weight-bold font-' + status[data].state + '">' + status[data].title + '</span>';
                },
            },
        ],
        select: {
            style: 'multi',
            selector: 'td:first-child'
        },
    });

    $table.DataTable().on( 'draw', function () {
        // Switch
        /* $('input.bootstrap-toggle').bootstrapToggle(
            {
                on: '<i class="text-white la la-check" style="font-size:8px;"></i>',
                off: '<i class="text-white la la-close" style="font-size:8px;"></i>'
            }
        ); */
    } );

    // Export and tools buttons
    $("#" + code + " #export_print").on("click", function(e) {
        e.preventDefault(), $table.DataTable().button(0).trigger()
    }
    );
    $(" #" + code + " #export_copy").on("click", function(e) {
        e.preventDefault(), $table.DataTable().button(1).trigger()
    }
    );
    $(" #" + code + " #export_excel").on("click", function(e) {
        e.preventDefault(), $table.DataTable().button(2).trigger()
    }
    );
    $(" #" + code + " #export_csv").on("click", function(e) {
        e.preventDefault(), $table.DataTable().button(3).trigger()
    }
    );
    $(" #" + code + " #export_pdf").on("click", function(e) {
        e.preventDefault(), $table.DataTable().button(4).trigger()
    }
    );

    // Config
    var buttonsArray = [];
    // Print
    if (
        code in configArray && "print" in configArray[code] && configArray[code]['print']
    ) {
        buttonsArray.push(
            {
                extend: 'print',
                text: '',
                className: 'd-none'
            }
        );
        
    } else {
        $("#" + code + " #export_print").remove();
    }
    // Copy
    if (
        code in configArray && "copy" in configArray[code] && configArray[code]['copy']
    ) {
        buttonsArray.push(
            {
                extend: 'copyHtml5',
                text: '',
                className: 'd-none'
            }
        );
        
    } else {
        $(" #" + code + " #export_copy").remove();
    }
    // Excel
    if (
        code in configArray && "excel" in configArray[code] && configArray[code]['excel']
    ) {
        buttonsArray.push(
            {
                extend: 'excelHtml5',
                text: '',
                className: 'd-none'
            }
        );
       
    } else {
        $(" #" + code + " #export_excel").remove();
    }
    // CSV
    if (
        code in configArray && "csv" in configArray[code] && configArray[code]['csv']
    ) {
        buttonsArray.push(
            {
                extend: 'csvHtml5',
                text: '',
                className: 'd-none'
            }
        );
        
    } else {
        $(" #" + code + " #export_csv").remove();
    }
    // PDF
    if (
        code in configArray && "pdf" in configArray[code] && configArray[code]['pdf']
    ) {
        buttonsArray.push(
            {
                extend: 'pdfHtml5',
                text: '',
                className: 'd-none'
            }
        );
        
    } else {
        $(" #" + code + " #export_pdf").remove();
    }
    // Colvis
    if (
        code in configArray && "colvis" in configArray[code] && configArray[code]['colvis']
    ) {
        buttonsArray.push(
            {
                extend: 'colvis',
                text: '<i class="fas fa-columns" title="Choisir les colonnes à afficher"></i>&nbsp;Colonnes',
                className: 'btn-shadow ml-2 mr-1 btn btn-primary'
            }
        );
    }
    // SelectAll
    if (
        code in configArray && "selectAll" in configArray[code] && configArray[code]['selectAll']
    ) {
        buttonsArray.push(
            {
                extend: 'selectAll',
                text: '<i class="far fa-check-circle"></i>',
                className: 'text-primary bg-white p-0 border-0 d-none'
            }
        );
    }
    // SelectNone
    if (
        code in configArray && "selectNone" in configArray[code] && configArray[code]['selectNone']
    ) {
        buttonsArray.push(
            {
                extend: 'selectNone',
                text: '<i class="far fa-times-circle"></i>',
                className: 'text-secondary bg-white p-0 border-0 d-none'
            }
        );
    }

    new $.fn.dataTable.Buttons( $table.DataTable(), {
        buttons: buttonsArray
    } );

    $table.DataTable().buttons().container()
        .appendTo($('#' + code + ' .dataTables_filter label'));

    $('#' + code + ' .table-select-header').append($('#' + code + ' .buttons-select-all '));
    $('#' + code + ' .table-select-header').append($('#' + code + ' .buttons-select-none '));

    $('#' + code + ' .buttons-select-all ').removeClass('d-none')
    .on('click', function(e) {
        $('#' + code + ' .buttons-select-all ').addClass('d-none')
        $('#' + code + ' .buttons-select-none ').removeClass('d-none')
    });

    $('#' + code + ' .buttons-select-none ')
    .on('click', function(e) {
        $('#' + code + ' .buttons-select-none ').addClass('d-none')
        $('#' + code + ' .buttons-select-all ').removeClass('d-none')
    });
    
    $('#' + code + ' .colvis--button')
    .on('click', function(e) {
        $('.dt-button-collection').find("a").each(function( index, value ) {
            $(this).parent().addClass('d-flex flex-column');
            $(this).addClass('nav-link ').removeClass('dropdown-item');
        });
        setTraductions(code);

        // Save Filters
        $('.buttons-columnVisibility').off('click.colvis');
        $('.buttons-columnVisibility').on('click.colvis', function(e) {
            var column = $(this).data('origine');
            var valueData = $(this).hasClass('active');

            $.ajax({
                method: "POST",
                url: '../../api/filtre/user/list/' + code,
                data: {
                    champ: column,
                    value: valueData
                }
            })
                .done(function(data) {
                    return data;
            });
        });
    });

    // AdvancedSearch
    addAdvancedSearchButton(code);

    // ViewAll
    if (
        code in configArray && "viewAll" in configArray[code] && configArray[code]['viewAll']
    ) {
        addViewAllButton($table, code);
    }
    // Reset
    if (
        code in configArray && "reset" in configArray[code] && configArray[code]['reset']
    ) {
        addResetButton($table, code);
    }

    // Check Tools
    if ($('#' + code + ' #tools--dropdowns--button').find('button').length == 1) {
        $('#' + code + ' #tools--dropdowns--button').remove();
    }
    
    // Check Actions
    if ($('#' + code + ' #actions--dropdowns--button').find('button').length == 1) {
        $('#' + code + ' #actions--dropdowns--button').remove();
    }
}

// Toggle in database
function toggleData($target, entityData, value) {
    $target.parents('div.bootstrap-toggle-wrapper').after($animation);

    // Column
    var column = "";
    $target.parents('td').attr('class').split(' ')
    .map(function(clssName){     
        if (clssName != " " || clssName != "tinyint") {
            column = clssName.trim();
        }
    });

    // Id
    var $parentTr = $target.parents('tr');
    var id = $parentTr.find('.action--div').data('id');
    
    Pace.track(function(){
        $.ajax({
            method: "PUT",
            url: '../../api/datatable/data/' + id +'/update',
            data: {
                column: column,
                entity: entityData,
                value: value
            }
            })
            .done(function( data ) {
                $target.parents('div.bootstrap-toggle-wrapper').toggleClass('bootstrap-toggle-disabled');
                clearAnimation();
                $target.parents('div.bootstrap-toggle-wrapper').after($terminated);
                setTimeout(clearTerminated,2000);
                return data;
        });
    });

}

// Change in database
function updateData($target, entityData, dateTime = false) {
    // Column
    var column = "";
    $target.attr('class').split(' ')
    .map(function(clssName){     
        if (clssName != " " || clssName != "varchar") {
            column = clssName.trim();
        }
    });

    // Id
    var $parentTr = $target.parent();
    var id = $parentTr.find('.action--div').data('id');

    // Text
    var text = $target.text();
    
    if ($target.hasClass('int')) {
        var $input = $('<input type="number" class="form-control list-input" name="' + column + ' "value="' + text + '">');
    } else {
        var $input = $('<input type="text" class="form-control list-input" name="' + column + ' "value="' + text + '">');
    }
    
    if (dateTime) {

        $input.datepicker({
            format: {
                toDisplay: function (date, format, language) {
                    var d = new Date(date);
                    return d.toISOString();
                },
                toValue: function (date, format, language) {
                    var d = new Date(date);
                    return new Date(d);
                }
            }
        });
    }
    $target.html($input);

    $input
    .on( 'change', function () {
        var value = $input.val();
        if (dateTime) {
            var date = new Date(value);
            var formattedDate =  date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
            value =  date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            $('.datepicker').remove();
            $target.html('<span class="badge badge--inline badge--pill"><i class="la la-calendar-o"></i>&nbsp;' + formattedDate + '</span>');
            
        } else {
            $target.html(value);
        }
        
        $target.append($animation);
        Pace.track(function(){
            $.ajax({
                method: "PUT",
                url: '../../api/datatable/data/' + id +'/update',
                data: {
                    column: column,
                    entity: entityData,
                    value: value
                }
            })
                .done(function( data ) {
                    clearAnimation();
                    $target.append($terminated);
                    setTimeout(clearTerminated,2000);
                    return data;
            });
        });
    });
}

// Change in database
function updateRelatedData($target, entityData) {

    // Column
    var column = "";
    $target.attr('class').split(' ')
    .map(function(clssName){     
        if (clssName != " " || clssName != "relation") {
            column = clssName.trim();
        }
    });

    Pace.track(function(){
        $.ajax({
            method: "POST",
            url: '../../api/datatable/data/related',
            data: {
                column: column,
                entity: entityData,
            }
            })
            .done(function(data) {
                openRelatedDataDropdown($target, entityData, column, data);
                return data;
        });
    });
}

// Related data Dropdown
function openRelatedDataDropdown($target, entityData, column, data) {
    // Id
    var $parentTr = $target.parent();
    var id = $parentTr.find('.action--div').data('id');

    var $menu = $('<div class="d-inline-block dropdown">'
        + '<button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="btn-shadow dropdown-toggle btn btn-info">'
        + '<i class="la la-bars"></i>'
        + '</button>'
        + '<div tabindex="-1" role="menu" aria-hidden="true" class="dropdown-menu dropdown-menu-right">'
            + '<ul class="nav flex-column">'
            + '</ul>'
        + '</div>'
        + '</div>'
    );

    for (var element in data) {
        var $li = $('<li data-id="' + element + '" class="list-nav__section list-nav__section--first">' + data[element] + '</li>')
        .on('click', function(e) {
            // Params
            var valueId = $(this).data('id');
            var value = $(this).text(); 

            $(this).parents('.dropdown-menu').remove();
            $target.html('<span class="badge badge--custom badge--inline badge--pill">' + value + '</span>');
            $target.append($animation);

            Pace.track(function(){
                $.ajax({
                    method: "PUT",
                    url: '../../api/datatable/data/' + id +'/update',
                    data: {
                        column: column,
                        entity: entityData,
                        value: valueId
                    }
                })
                    .done(function( data ) {
                        clearAnimation();
                        $target.append($terminated);
                        setTimeout(clearTerminated,2000);
                        return data;
                });
            });
        });

        $menu.find('ul').append($li);       
    }
    
    $target.html($menu);

}

// Inline edit + Switch listeners
function listenTdClick(entityData, code) {
    $('#' + code + ' td.datetime')
    .on('dblclick', function(e) {
        var $target = $(this);
        var dateTime = true;
        updateData($target, entityData, dateTime)
    });

    $('#' + code + ' td.relation')
    .on('dblclick', function(e) {
        var $target = $(this);
        updateRelatedData($target, entityData)
    });

    $('#' + code + ' td.varchar')
    .on('dblclick', function(e) {
        var $target = $(this);
        updateData($target, entityData);
    });

    $('#' + code + ' td.int')
    .on('dblclick', function(e) {
        var $target = $(this);
        updateData($target, entityData);
    });
    
    $('#' + code + ' td.tinyint .toggle')
    .on("click", function() {
        var $target = $(this);
        var value = $target.find('input').prop('checked') ? 0 : 1;
        toggleData($target, entityData, value);
    });


    $('#' + code + ' .bootstrap-toggle-handle-on')
    .on("click", function() {
        alert('test');
        var $target = $(this);
        $target.parents('div.bootstrap-toggle-wrapper').toggleClass('bootstrap-toggle-disabled');
        toggleData($target, entityData, 0);
    });

    $('#' + code + ' .bootstrap-toggle-handle-off')
    .on("click", function() {
        alert('test');
        var $target = $(this);
        $target.parents('div.bootstrap-toggle-wrapper').toggleClass('bootstrap-toggle-disabled');
        toggleData($target, entityData, 1);
    });

    $("#" + code + ".bootstrap-toggle-label")
    .on("click", function() {
        alert('test');
        var $parentWrapper = $(this).parents('div.bootstrap-toggle-wrapper');
        if ($parentWrapper.hasClass('bootstrap-toggle-off')) {
            var $target = $parentWrapper.find(".bootstrap-toggle-handle-off");
            $target.parents('div.bootstrap-toggle-wrapper').toggleClass('bootstrap-toggle-disabled');
            toggleData($target, entityData, 0);
        } else {
            var $target = $parentWrapper.find(".bootstrap-toggle-handle-on");
            toggleData($target, entityData, 1);
        }
        
    });
}

// Traductions Set in HTML
function setTraductions(code) {
    if (code in champsArray) {
        for (var champsElement in champsArray[code]) {
            $('th:contains("' + champsElement +'")').each(function() {
                if ($(this).text() == champsElement) {
                    $(this).text(champsArray[code][champsElement]['label']);
                }
            });

            $('label:contains("' + champsElement +'")').each(function() {
                if ($(this).text() == champsElement) {
                    $(this).text(champsArray[code][champsElement]['label']);
                }
            });

            $('.buttons-columnVisibility span:contains("' + champsElement +'")').each(function() {
                if ($(this).text() == champsElement) {
                    $(this).parent().data('origine', champsElement);
                    $(this).text(champsArray[code][champsElement]['label']);
                }
            });
        }
    }
}

// Clear Animation
function clearAnimation() {
    $('.animation').remove();
}

// Clear Terminated
function clearTerminated() {
    $('.terminated').remove();
}