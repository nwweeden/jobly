## Filtering

  - decide whether or not there are request parameters passed in req.body
    - if there are not, run Company.findAll() as written
    - if there are parameters: validate them

  - Validate for:
    - parameters only inlclude name, minEmployees, maxEmployees
    - minEmployees < maxEmployees

  - In our models method:
    - Filter according to parameters passed in req.body
    - Name is case insensitive
    - Should still just return [ {handle, name}, ...]