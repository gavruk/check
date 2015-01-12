$ = jQuery
$.check = {}
$.check.fn = {}
$.fn.check = (opts) ->
  $.check.fn.construct.apply(this, opts)

class Check

  checkTemplate: """
  <div class="check-container">
      <div class="check">
          <div class="front">
              <div class="higher">
                  <div class="name display">{{name}}</div>
                  <div class="order display">
                      <div class="ordertext">PAY TO THE ORDER OF</div>
                      <div class="orderval">{{order}}</div>
                  </div>
                  <div class="bankname display">{{bankName}}</div>
              </div>
              <div class="lower">
                  <div class="routing-box">
                      <div class="label">Routing Number</div>
                      <div class="routingnumber display">{{routingNumber}}</div>
                  </div>
                  <div class="account-box">
                      <div class="label">Account Number</div>
                      <div class="accountnumber display">{{accountNumber}}</div>
                  </div>
                  <div class="numbers">1234</div>
              </div>
          </div>
      </div>
  </div>
  """
  template: (tpl, data) ->
    tpl.replace /\{\{(.*?)\}\}/g, (match, key, str) ->
      data[key]
  defaults:
    formSelectors:
      accountNumberInput: 'input[name="account-number"]'
      routingNumberInput: 'input[name="routing-number"]'
      nameInput: 'input[name="name"]'
      bankNameInput: 'input[name="bank-name"]'
      orderInput: 'input[name="order"]'
    checkSelectors:
      checkContainer: '.check-container'
      check: '.check'
      accountNumberDisplay: '.accountnumber'
      routingNumberDisplay: '.routingnumber'
      nameDisplay: '.name'
      bankNameDisplay: '.bankname'
      orderDisplay: '.orderval'
    values:
      accountNumber: '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;'
      routingNumber: '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;'
      name: 'Full Name'
      bankName: 'Bank Name'
      order: '_________________________'

  constructor: (el, opts) ->
    @options = $.extend(true, {}, @defaults, opts)
    $.extend @options.values, $.check.values

    @$el = $(el)

    unless @options.container
      console.log "Please provide a container"
      return

    @$container = $(@options.container)

    @render()
    @attachHandlers()
    @handleInitialValues()

  render: ->
    @$container.append(@template(
      @checkTemplate,
      $.extend({}, @options.values)
    ))

    $.each @options.checkSelectors, (name, selector) =>
      this["$#{name}"] = @$container.find(selector)

    $.each @options.formSelectors, (name, selector) =>
      if @options[name]
        obj = $(@options[name])
      else
        obj = @$el.find(selector)

      this["$#{name}"] = obj

    if @options.width
      baseWidth = parseInt @$checkContainer.css('width')
      @$checkContainer.css "transform", "scale(#{@options.width / baseWidth})"

  attachHandlers: ->
    @$accountNumberInput
      .bindVal @$accountNumberDisplay,
        fill: false,
        filters: @accountNumberFilter
      .on 'keydown', @handle('captureAccountNumber')
    @$routingNumberInput
      .bindVal @$routingNumberDisplay,
        fill: false,
      .on 'keydown', @handle('captureRoutingNumber')
    @$bankNameInput
      .bindVal @$bankNameDisplay,
        fill: false,
      .on 'keydown', @handle('captureName')
    @$orderInput
      .bindVal @$orderDisplay,
        fill: false,
    @$nameInput
      .bindVal @$nameDisplay,
        fill: false
        join: ' '
      .on 'keydown', @handle('captureName')

  accountNumberFilter: (val, $el) ->
      if val.length <= 10
          return val
      beg = val.substring(0, 3)
      end = val.substring(val.length - 4)
      return beg + '...' + end

  handleInitialValues: ->
    $.each @options.formSelectors, (name, selector) =>
      el = this["$#{name}"]
      if el.val()
        # if the input has a value, we want to trigger a refresh
        el.trigger 'paste'
        setTimeout -> el.trigger 'keyup'

  handle: (fn) ->
    (e) =>
      $el = $(e.currentTarget)
      args = Array.prototype.slice.call arguments
      args.unshift $el
      @handlers[fn].apply this, args

  handlers:
    captureName: ($el, e) ->
      keyCode = e.which or e.keyCode
      banKeyCodes = [48,49,50,51,52,53,54,55,56,57,106,107,109,110,111,186,187,188,189,190,191,192,219,220,221,222]

      # Allow special symbols:
      #   - hyphen
      #   - dot
      #   - apostrophe
      allowedSymbols = [
        189, 109 # hyphen (when not using shiftKey)
        190, 110 # dot (when not using shiftKey)
        222 # apostrophe (when not using shiftKey)
      ]

      if banKeyCodes.indexOf(keyCode) != -1 and not (!e.shiftKey and keyCode in allowedSymbols)
        e.preventDefault()
    captureAccountNumber: ($el, e) ->
      val = $el.val()
      maxLength = 10

      if !@isKeyAllowedForNumber(e)
        e.preventDefault()
        return
      #if val.length == maxLength and !@isSpecialKey(e)
        #e.preventDefault()
    captureRoutingNumber: ($el, e) ->
      val = $el.val()
      maxLength = 9

      if !@isKeyAllowedForNumber(e)
        e.preventDefault()
        return
      if val.length == maxLength and !@isSpecialKey(e)
        e.preventDefault()

  isKeyAllowedForNumber: (e) ->
    keyCode = e.which or e.keyCode
    if keyCode >= 48 and keyCode <= 57
      return true
    if keyCode >= 96 and keyCode <= 105
      return true
    if e.ctrlKey or e.metaKey
      return true
    allowedKeyCodes = [8,9,17,35,36,37,39,46,91,92,144,145]
    if allowedKeyCodes.indexOf(keyCode) != -1
      return true
    return false
  isSpecialKey: (e) ->
    keyCode = e.which or e.keyCode
    allowedKeyCodes = [8,9,17,35,36,37,39,46,91,92,144,145]
    if allowedKeyCodes.indexOf(keyCode) != -1
      return true
    return false

  $.fn.bindVal = (out, opts={}) ->
    opts.fill = opts.fill || false
    opts.filters = opts.filters || []
    opts.filters = [opts.filters] unless opts.filters instanceof Array

    opts.join = opts.join || ""
    if !(typeof(opts.join) == "function")
      joiner = opts.join
      opts.join = () -> joiner

    $el = $(this)
    outDefaults = (out.eq(i).text() for o, i in out)

    $el.on 'focus', ->
      out.addClass 'focused'

    $el.on 'blur', ->
      out.removeClass 'focused'

    $el.on 'keyup change paste', (e) ->
      val = $el.map(-> $(this).val()).get()
      join = opts.join(val)

      val = val.join(join)
      val = "" if val == join

      for filter in opts.filters
        val = filter(val, $el, out)

      for o, i in out
        if opts.fill
          outVal = val + outDefaults[i].substring(val.length)
        else
          outVal = val or outDefaults[i]

        out.eq(i).text(outVal)

    $el

$.fn.extend check: (option, args...) ->
  @each ->
    $this = $(this)
    data = $this.data('check')

    if !data
      $this.data 'check', (data = new Check(this, option))
    if typeof option == 'string'
      data[option].apply(data, args)
