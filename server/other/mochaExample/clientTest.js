
var assert = {

    exists: function(x) { return !!x; }
    ,equal: function(a,b) { return a==b; }
    ,fail: function() { throw new Error("foo"); }
    ,works: function() { return true; }
};


describe('never works', function() {
//    describe('yep', function() {
	it('really never works', function() {
	    assert.fail();
	});
//    });
});


describe('document', function() {
    describe('all', function() {
	it('should be present', function(){
	    assert.exists(document.all);
	});
    });
});
      


describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});

