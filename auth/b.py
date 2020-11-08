def primegen(c):
    c = c+2
    d=0
    for k in range(2,c//2):
        if c%k == 0:
            d=1
            break
    if d == 1:
        primegen(c)
    else:
        return c



t = int(input())
for i in range(t):
    n = int(input())
    a = list(map(int,input().split()))
    b = [None] * n
    b[0] = 2
    b[a[0]-1] = 2
    c = 1
    for j in range(1,n):
        if b[j] == None:
            c = primegen(c)
            b[j] = c
            if(b[a[j]-1]==None):
                b[a[j]-1]=c
            else:
                if a[j]-1 != j:
                    b[a[j]-1] *= c
    print(b)
