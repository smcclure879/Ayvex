

function shortNow() {
    const x = new Date();
    //return x.toString('dddd','HH','mm');
    return ['Sa','Su','M','Tu','W','Th','F'][ x.getDay() ]
	+ x.getHours() + ":" + x.getMinutes() ;      
}

console.log(shortNow());
