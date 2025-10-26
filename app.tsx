=LET(txt,A2,
digits, TEXTJOIN("",,IF(ISNUMBER(--MID(txt,SEQUENCE(LEN(txt)),1)),MID(txt,SEQUENCE(LEN(txt)),1),"")),
digits)


=LEFT(A2, MIN(FIND({0,1,2,3,4,5,6,7,8,9}&" ",A2&" "))-1)
=LEFT(A2, MATCH(FALSE, ISNUMBER(--MID(A2, ROW($1:$50), 1)), 0)-1)


