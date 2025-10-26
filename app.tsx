=LET(txt,A2,
digits, TEXTJOIN("",,IF(ISNUMBER(--MID(txt,SEQUENCE(LEN(txt)),1)),MID(txt,SEQUENCE(LEN(txt)),1),"")),
digits)
