t = int(input())
for i in range(t):
    n = int(input())
    a = list(map(int,input().split()))
    b1 = max(a)
    a.remove(max(a))
    b2 = max(a)
    a.remove(max(a))
    while a:
        if(b1<b2):
            b1 = b1+max(a)
        else:
            b2 = b2 + max(a)
        a.remove(max(a))
    if(b1>b2):
        print(b1)
    else:
        print(b2)