main:
var $a;
var $b;
$a = 10;
$b = 20;
t1 = $a < $b;
ifZ t1 goto l1;
push $a;
call output;
goto l2;
l1:
push $b;
call output;
l2:
l3:
t2 = $a < $b;
ifZ t2 goto l4;
t3 = $a + 1;
$a = t3;
goto l3;
l4:
$a = 0;
l5:
t4 = $a < 5;
ifZ t4 goto l6;
goto l8;
l7:
t5 = $a + 1;
$a = t5;
goto l5;
l8:
push $a;
call output;
goto l7;
l6:
