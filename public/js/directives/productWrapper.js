app.directive('productWrap', () => {
    return {
      	restrict: 'EA',
        scope: { product: '=productData', label: `=label`, update: `=clicky`, customer:"=customer", numbers:"=numbers"},
        template: `<div class="cell">
                      <img src="{{product.image}}">
                      <p class="name">{{product.name | capitalize}}</p>
                      <p><span class="glyphicon glyphicon-usd"></span> {{product.price}}</p>
                      <select ng-show="customer" ng-init="selected = numbers[0]" ng-model="selected" ng-options="number for number in numbers" class="form-control"></select>
                      <div>
                        <button class="containerBtn" ng-click="exec($event, product._id, selected)">
                          <span>{{label}}</span>
                          <div class="icon-cart" style="clear: left; float: left">
                            <div class="cart-line-1" style="background-color: rgb(70, 33, 58)"></div>
                            <div class="cart-line-2" style="background-color: rgb(70, 33, 58)"></div>
                            <div class="cart-line-3" style="background-color: rgb(70, 33, 58)"></div>
                            <div class="cart-wheel" style="background-color: rgb(70, 33, 58)"></div>
                          </div>
                        </button>
                      </div>
                      <span class="glyphicon glyphicon-ok"></span>
                    </div>`,
      link: (scope, element, attrs) => scope.exec =  (e, id, quantity) => scope.update(e, id, quantity)
    }
})