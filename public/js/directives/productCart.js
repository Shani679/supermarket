app.directive('cartProduct', () => {
  return {
    restrict: 'E',
    scope: {product:'=data', step: '=step', update: '=updateQuantity', remove: '=removeProduct'},
      template: `
               <li class="product">
                <div class="product-preview">
                   <div class="img">
                      <img class="image" src="{{product.products.image}}">
                   </div>
                   <div class="product-paper">
                      <div class="product-name">{{product.products.name | capitalize}}</div>
                      <div class="product-price"><span class="glyphicon glyphicon-usd"></span> {{product.total}}</div>
                   </div>
                </div>
                <div class="product-quantity">x{{product.quantity}}</div>
                <div class="product-interactions" ng-show="step">
                   <div class="button plus cartBtn" ng-click="updateProductQuantity($event, product.products._id, 1)">+</div>
                   <div class="button minus cartBtn" ng-click="updateProductQuantity($event, product.products._id, -1)">-</div>
                   <div class="button del cartBtn" ng-click="removeProductFromCart(product.products._id)"></div>
                </div>
              </li>`,
    link: (scope, element, attrs) => {
      scope.updateProductQuantity = (e, id, quantity) => scope.update(e, id, quantity)
      scope.removeProductFromCart = id => scope.remove(id)
    }
  }
})