app.directive('popup', SuperServices => {
    return {
      	restrict: 'E',
        scope:{customerName: `=user`},
        template: `<div class="window">
                  <div class="box">
                    <div class="panel panel-success">
                      <div class="panel-heading">
                      </div>
                      <div class="panel-body">
                        <h1>Your purchase was completed successfully!</h1>
                        <h3>To download receipt click <a id="trigger" ng-click="downloadFile()">here</a><a id="download" download="receipt.txt"></a></h3>
                      </div>
                      <div class="panel-footer">
                        <button class="btn btnPush" ng-click="confirm()">OK</button>
                      </div>
                    </div>
                  </div>
                </div>`,
      link: (scope, element, attrs) => {
        scope.confirm =  () => window.location.href="/";
        scope.downloadFile = () => {
          SuperServices.ajaxCall('super/receipt', 'get').then(({data})=>{
            const content = "Cutomer name: " + scope.customerName + '\r\n' + "Order date: " + data.data.orderDate + '\r\n' + "Total products: " + data.data.cart.items.length + '\r\n' + "Total price: " + data.data.cart.totalPrice + "$" + '\r\n' + '\r\n' + 'Thank you for your purchase,' + '\r\n' + "Fresh Direct.";
            $('popup #download').attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
            document.getElementById('download').click();
          }).catch((err) => status === 401 ? window.location.href="/" : console.log(err));
        }
      }
    }
})