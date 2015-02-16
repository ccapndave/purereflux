# purereflux

(for the future)

```
macro @ {
  rule {
    $($name($args...))
    export function $name:ident( $($params:ident) (,) ...) $body
  } => {
    $name() {
        return PureReflux.Getter(function() $body)
    }
  }
}

@Inject(A, B)
export function getAllCourses() {
    return this.menu.get("courses");
}
```