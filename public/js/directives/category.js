app.directive('categoryBtn', () => {
  return {
    restrict: 'E',
    scope: { category: '=category', fetch: "=clicky"},
    template: `
                <li class="categotyBtn" ng-click="exec(category._id)" id="{{category._id}}">
                  {{category.name | capitalize}}
                </li>
              `,
    link: (scope, element, attrs) => scope.exec =  (id) => scope.fetch(id)
  }
})