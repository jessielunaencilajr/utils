// Create table with IDs of fields
// Dynamic columns? how? cookies?
// optional fields
// add tests

toastr.options.newestOnTop = false;

class ApiToTable { 
    constructor({
        url,
        prefix,
        fields,
        indexCol='id',
        indexColDisplay=null,
        buttons=[],
        softDelete=null,
        params='',
    }) {
        this.url = url
        this.prefix = prefix
        this.card = $(`#${prefix}-card`)
        this.cardButtonGroupId = `${prefix}-button-group`
        this.tableId = `${prefix}-table`
        this.tableHeaderId = `${prefix}-table-header`
        this.tableBodyId = `${prefix}-table-body`
        this.buttons = buttons
        this.softDelete = softDelete
        this.params = params

        this.fields = fields
        this.indexCol = indexCol
        this.indexColDisplay = (indexColDisplay) ? indexColDisplay : indexCol
        
        this._addCardHeader()
        this._addCardBody()
        this.table = $(`#${this.tableId}`)

        this._addCardButtons()

        this.load()
    }

    _addCardHeader() {
        let that = this
        let cardHeader = $(
            `<div class="card-header">
                <div class="row">
                    <div class="d-flex col-md-12 justify-content-between">
                        <h4 class="text">${that.prefix.title()}</h4>
                        <div class="btn-group" role="group" id="${that.cardButtonGroupId}">
                        </div>
                    </div>
                </div>
            </div>`
        )
        $(that.card).append(cardHeader)
    }

    _createTable() {
        let that = this
        let table = 
            `<table id="${that.tableId}" class="table" style="width: 100%">
                <thead id="${that.tableHeaderId}"></thead>
                <tbody id="${that.tableBodyId}"></tbody>
            </table>`
        return table
    }

    _addCardBody() {
        let that = this
        let table = that._createTable()
        let cardBody = $(
            `<div class="card-body">
                <div class="row">
                    <div class="col-md-12">
                        ${table}
                    </div>
                </div>
            </div>`
        )
        $(that.card).append(cardBody)
    }

    _addFields(modalFieldId, modalType, rowData) {
        let modalFields = $(`#${modalFieldId}`)
        let that = this
        for (const [field, details] of Object.entries(that.fields)) {

            if ('modals' in details && !details.modals.includes(modalType)) { continue }

            let fieldId = `${modalFieldId}-${field}`
            let label = ('label' in details) ? details.label : field.title()
            let placeholder = ('placeholder' in details) ? details.placeholder : label

            let disabled = (modalType == 'edit' && details['readyOnly']) ? 'disabled' : ''
            disabled = (modalType == 'delete') ? 'disabled' : disabled

            if (details.type == 'dropdown') {
                modalFields.append(`
                <div class="col-md-6">
                    <div class="form-group input-group-sm has-error">
                        <label for="${fieldId}">${label}</label>
                        <select ${disabled} class="form-control" id="${fieldId}"></select>
                        <span class="text-danger" id="${fieldId}-error"></span>
                    </div>
                </div>`
                )
                $(`#${fieldId}`).empty()
                for (const [optVal, optHtml] of Object.entries(details.options)) {
                    let opt = $('<option></option>').val(optVal).html(optHtml)
                    if (optVal == 'null') { opt.prop("disabled", true) }
                    $(`#${fieldId}`).append(opt)
                    
                    if (rowData[field] == optHtml) {
                        $(`#${fieldId} option[value="${optVal}"]`).prop('selected', true)    
                    }
                }
                
                if (modalType != 'add') { continue }
                if ('default' in details) {
                    $(`#${fieldId} option[value="${details.default}"]`).prop('selected', true)
                }
                
            }
            else if (details.type == 'text') {
                let value = (rowData[field]) ? rowData[field] : ''
                modalFields.append(`
                <div class="col-md-6">
                    <div class="form-group input-group-sm">
                        <label for="${fieldId}">${label}</label>
                        <input ${disabled} type="text" class="form-control" placeholder="${placeholder}" id="${fieldId}" value="${value}">
                        <span class="text-danger" id="${fieldId}-error"></span>
                    </div>
                </div>`
                )
            }
            else if (details.type == 'textarea') {
                let rows = ('rows' in details) ? details.rows : 10
                let value = (rowData[field]) ? rowData[field] : ''
                modalFields.append(`
                <div class="col-md-12">
                    <div class="form-group input-group-sm">
                        <label for="${fieldId}">${label}</label>
                        <textarea ${disabled} class="form-control" id="${fieldId}" rows="${rows}" style="height:auto;">${value}</textarea>
                        <span class="text-danger" id="${fieldId}-error"></span>
                    </div>
                </div>`
                )
            }
            else if (details.type == 'checkbox') {
                modalFields.append(`
                <div class="col-md-6">
                    <div class="form-check">
                        <input ${disabled} type="checkbox" class="form-check-input" id="${fieldId}">
                        <label class="form-check-label" for="${fieldId}">${label}</label>
                    </div>
                </div>`
                )
            }
            else if (details.type == 'date') {
                let value = ((rowData[field] == null) || (rowData[field] == "null")) ? '' : rowData[field].slice(0,10)
                modalFields.append(`
                <div class="col-md-6">
                    <div class="form-group input-group-sm">
                        <label for="${fieldId}">${label}</label>
                        <input ${disabled} type="date" class="form-control" id="${fieldId}" value="${value}">
                        <span class="text-danger" id="${fieldId}-error"></span>
                    </div>
                </div>`
                )
            }
            else if (details.type == 'datetime_as_date') {
                let value = ((rowData[field] == null) || (rowData[field] == "null")) ? '' : rowData[field].slice(0,10)
                modalFields.append(`
                <div class="col-md-6">
                    <div class="form-group input-group-sm">
                        <label for="${fieldId}">${label}</label>
                        <input ${disabled} type="date" class="form-control" id="${fieldId}" value="${value}">
                        <span class="text-danger" id="${fieldId}-error"></span>
                    </div>
                </div>`
                )
            }
            else if (details.type == 'datetime') {
                let value = ((rowData[field] == null) || (rowData[field] == "null")) ? '' : rowData[field].slice(0,10)
                modalFields.append(`
                <div class="col-md-6">
                    <div class="form-group input-group-sm">
                        <label for="${fieldId}">${label}</label>
                        <input ${disabled} type="datetime-local" class="form-control" id="${fieldId}" value="${value}">
                        <span class="text-danger" id="${fieldId}-error"></span>
                    </div>
                </div>`
                )
            }
        }
    }

    _createFormData(modalFieldId) {
        let that = this
        let formData = new FormData()
        
        for (const [field, details] of Object.entries(that.fields)) {
            let modalField = $(`#${modalFieldId}-${field}`)
            if (modalField.val() == null) { continue }
            let modalFieldVal = modalField.val().trim()

            if (modalField.is(':checkbox')) {
                modalFieldVal = (modalField.is(':checked')) ? true : false
            }
            if (details.type == 'datetime_as_date') {
                modalFieldVal = `${modalField.val().trim()} 00:00:00`
            }

            formData.append(field, modalFieldVal)
        }
        return formData
    }

    _showError(modalFieldId, data) {
        for (const [field, details] of Object.entries(data)) {
            $(`#${modalFieldId}-${field}-error`).html(details)
        }
    }

    _clearError(modalFieldId) {
        let that = this
        for (const field of Object.keys(that.fields)) {
            $(`#${modalFieldId}-${field}-error`).html('')
        }
    }

    _createModal(modalType, rowData={}) {
        let that = this
        let modalId = `${that.tableId}-modal-${modalType}`
        let modalTitleIndex = (rowData[that.indexColDisplay]) ? rowData[that.indexColDisplay] : ''
        let deleteWarning = (modalType == 'delete') ? `<div class="row"><div class="col-md-12"><h5 class="text-danger" id='modal-body-title'><i class="fas fa-exclamation-triangle"></i>  All related data created under this ${that.prefix.title()} will also be deleted.</h5></div></div><hr>` : ''

        let modal = $(
            `<div class="modal fade" id="${modalId}" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${modalId}-title">${modalType.title()} ${that.prefix.title()} ${modalTitleIndex}</h5>
                            <button type="button" class="btn btn-danger" data-dismiss="modal" aria-label="Close" title="Close and discard changes"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div class="modal-body" id="${modalId}-body">
                            ${deleteWarning}
                            <div class="row" id="${modalId}-fields"></div>
                        </div>
                        <div class="modal-footer"><button class="btn btn-secondary float-right" type="button" id="${modalId}-btn">${modalType.title()}</button></div>
                    </div>
                </div>
            </div>`
        )
        $('body').append(modal)
        that._addFields(`${modalId}-fields`, modalType, rowData)
        
        modal.on('hidden.bs.modal', function() { $(this).remove() }) // Remove modal when closed
        modal.modal({backdrop: 'static', keyboard: false}) // Disable modal closing when clicked outside
        
        $(`#${modalId}-btn`).click(function() {

            that._clearError(`${modalId}-fields`)

            const csrftoken = Cookies.get('csrftoken')

            if (modalType == 'add') {
                const request = new Request(
                    `${that.url}`,
                    {headers: {'X-CSRFToken': csrftoken}}
                )
    
                let toastCreating = toastr.info(`Creating ${that.prefix.title()}...`)
    
                fetch(request, {
                    method: 'POST',
                    mode: 'same-origin',
                    body: that._createFormData(`${modalId}-fields`)
                }).then(function(response) {
                    toastCreating.remove()
    
                    if (response.status == 201) {
                        that.dataTable.ajax.reload(null, false)
                        modal.modal("hide")
                        toastr.success(`${that.prefix.title()} has been created!`)
                    }
                    else {
                        toastr.error(`Failed to create ${that.prefix.title()}!`, 'Error!')
                    }
                    return response.json()
    
                }).then(function(data) {
                    that._showError(`${modalId}-fields`, data)
                })
            }
            else if (modalType == 'edit') {
                const request = new Request(
                    `${that.url}${rowData[that.indexCol]}/`,
                    {headers: {'X-CSRFToken': csrftoken}}
                )
                
                fetch(request, {
                    method: 'PATCH',
                    mode: 'same-origin',
                    body: that._createFormData(`${modalId}-fields`)
                }).then(function(response) {
                    if (response.status == 200) {
                        that.dataTable.ajax.reload(null, false)
                        modal.modal("hide")
                        toastr.success(`${that.prefix.title()} ${modalTitleIndex}`, `Changes have been saved`)
                    }
                    else {
                        toastr.error(`Failed to save changes to ${that.prefix.title()} ${modalTitleIndex}`, `Error!`)
                    }
                    return response.json()
                }).then(function(data) {
                    that._showError(`${modalId}-fields`, data)
                })
            }
            else if (modalType == 'delete') {
                const request = new Request(
                    `${that.url}${rowData[that.indexCol]}/`,
                    {headers: {'X-CSRFToken': csrftoken}}
                )

                let formData = new FormData()

                if (that.softDelete) {
                    formData.append(
                        Object.keys(that.softDelete)[0],
                        Object.values(that.softDelete)[0])
                    
                    fetch(request, {
                        method: 'PATCH',
                        mode: 'same-origin',
                        body: formData
                    }).then(function(response) {
                        if (response.status == 200) {
                            that.dataTable.ajax.reload(null, false)
                            modal.modal("hide")
                            let toastrDelete = toastr

                            toastrDelete.options = {
                                closeButton: true,
                                timeOut: 0,
                                extendedTimeOut: 0,
                            }

                            toastrDelete.warning(`${that.prefix.title()} ${modalTitleIndex}`,`${that.prefix.title()} has been deleted!`)
                            
                            toastrDelete.options = {
                                closeButton: false,
                                timeOut: 5000,
                                extendedTimeOut: 1000,
                            }
                        }
                        else {
                            toastr.error(`Failed to delete ${that.prefix.title()} ${modalTitleIndex}`, `Error!`)
                        }
                        return response.json()
                    }).then(function(data) {
                        that._showError(`${modalId}-fields`, data)
                    })
                }
                else { //hard delete
                    fetch(request, {
                        method: 'DELETE',
                        mode: 'same-origin',
                        body: formData
                    }).then(function(response) {
                        if (response.status == 200) {
                            that.dataTable.ajax.reload(null, false)
                            modal.modal("hide")
                            let toastrDelete = toastr

                            toastrDelete.options = {
                                closeButton: true,
                                timeOut: 0,
                                extendedTimeOut: 0,
                            }

                            toastrDelete.warning(`${that.prefix.title()} ${modalTitleIndex}`,`${that.prefix.title()} has been deleted!`)
                            
                            toastrDelete.options = {
                                closeButton: false,
                                timeOut: 5000,
                                extendedTimeOut: 1000,
                            }
                            
                        }
                        else {
                            toastr.error(`Failed to delete ${that.prefix.title()} ${modalTitleIndex}`, `Error!`)
                        }
                    })
                }
            }
        })

        return modal
    }


    _getColumns() {
        let that = this
        let cols = []

        if (!(that.indexCol in that.fields)) {
            let col = {
                data:that.indexCol,
                title:that.indexCol.title(),
                visible:false,
            }
            cols.push(col)
        }

        for (const [field, details] of Object.entries(that.fields)) {
            let isVisible = ('visible' in details) ? details.visible : true
            let label = ('label' in details) ? details.label : field.title()
            let col = {
                title:label,
                data:field,
                visible:isVisible,
            }

            if (field == 'timestamp') {
                col.render = function (data, type, row, meta) {
                    return moment.utc(data).local().format('YYYY-MM-DD HH:mm:ss')
                }
            }
            cols.push(col)
            
        }

        let colBtn = ''
        let colBtnWidth = 0

        if (that.buttons.includes('edit')) {
            colBtn += "<button class='btn btn-secondary edit' title='Edit'></button>\n"
            colBtnWidth += 45

            $(`#${that.tableBodyId}`).on('click', 'button.edit', function () {
                setTimeout(function() { // Delay to make sure that row has been selected first
                    let rowData = that.dataTable.row( { selected: true } ).data()
                    let modal = that._createModal('edit', rowData)
                    modal.modal('show')
                }, 50)
            } )
        }
        if (that.buttons.includes('delete')) {
            colBtn += "<button class='btn btn-danger delete' title='Delete'></button>\n"
            colBtnWidth += 45

            $(`#${that.tableBodyId}`).on('click', 'button.delete', function () {
                setTimeout(function() { // Delay to make sure that row has been selected first
                    let rowData = that.dataTable.row( { selected: true } ).data()
                    let modal = that._createModal('delete', rowData)
                    modal.modal('show')
                }, 50)
            } )
        }

        if (colBtn != '') {
            cols.push({
                data:null,
                defaultContent: `<td style="white-space:nowrap;">${colBtn}</td>`,
                width: colBtnWidth,
                orderable: false,
            })
        }
        
        return cols
    }

    _addCardButtons() {
        let that = this
        if (that.buttons.includes('add')) {
            let btn = $(`<button class="btn btn-secondary float-right add mr-1" type="button" id="${that.prefix}-add-btn" title="Add New"></button>`)
            $(`#${that.cardButtonGroupId}`).append(btn)

            $(`#${that.prefix}-add-btn`).on('click', function () {
                let modal = that._createModal('add')
                modal.modal('show')
            })
        }
    }

    _getDataTableButtons() {
        let that = this
        let buttons = []

        if (that.buttons.includes('refresh')) {
            let btn = {
                text: '',
                className: 'btn-info refresh',
                attr:  {
                    title: 'Refresh',
                },
                action: function( e, dt, node, config) {
                    dt.ajax.reload(null, false)
                },
            }
            buttons.push(btn)
        }

        if (that.buttons.includes('excel')) {
            let btn = {
                extend: 'excel',
                title: '',
                filename: that.prefix.title(),
                text: '',
                className: 'btn-secondary export',
                attr:  {
                    title: 'Export to Excel',
                },
            }
            buttons.push(btn)
        }
        if (that.buttons.includes('csv')) {
            let btn = {
                extend: 'csv',
                text: '',
                className: 'btn-secondary csv',
                attr:  {
                    title: 'Export to CSV',
                },
            }
            buttons.push(btn)
        }
        return buttons
    }

    _preventRowUnselect() {
        let that = this
        that.dataTable.on('user-select', function ( e, dt, type, cell, originalEvent ) {
            let row = dt.row( cell.index().row ).node()
            if ( $(row).hasClass('selected') ) {
                dt.row( cell.index().row ).deselect()
            }
        })
    }

    load() {
        let that = this
        that.dataTable = that.table.DataTable({
            ajax: {
                url:`${that.url}?${that.params}`,
                dataSrc: '',
            },
            dom: "<'row'<'col-sm col-md' B><'col-sm col-md' i><'col-sm col-md' f>>" +
                "tr" +
                "<'row'<'col-sm col-md' l><'col-sm col-md' i><'col-sm col-md' p>>",
            columns: that._getColumns(),
            buttons: {
                dom: {
                    button: {
                        className: 'btn'
                    }
                },
                buttons: that._getDataTableButtons()
            },
            select: 'single',
            responsive: true,
        })
        that._preventRowUnselect()
    }

    subscribe(eventDetails) {
        let that = this
        that.table.addClass(eventDetails['subscriberClass'])
        that.table.on(eventDetails['eventName'], () => that.dataTable.ajax.reload(null, false))
    }

}