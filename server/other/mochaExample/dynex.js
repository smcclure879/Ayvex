


// var fooStr = "class foo {"+
// "  static go() { return 'foo'; }" +
// "}  ";


// var barStr = "class bar {"+
// "  static go() { return 'bar'; }"+
// "}  ";


jsl.load( "bar.dyn.js", function(handle) {
    alert( "hi" + bar.go() );

    jsl.unload( handle );

    alert("hi" + bar.go() );

} );


