t = int(input())
for i in range(t):
    n,k = map(int, input().split())
    s = input()
    i=0
    m = 0
    while i < len(s):
        if s[i] == 'M' or s[i] == 'I':
            c = 0
            j = i+1
            while j < len(s):
                if s[j] == 'X':
                    break
                elif s[i] == 'M' and s[j] == 'I':
                    d = k+1-abs(j-i)-c
                    if d >0:
                        m += 1
                        j += 1
                    break
                elif s[i] == 'I' and s[j] == 'M':
                    d = k+1-abs(j-i)-c
                    if d >0:
                        m += 1
                        j += 1
                    break 
                elif s[j] == ':':
                    c += 1
                    j +=1
                else:
                    j +=1
            i += j
        else:
            i += 1
    print(m)
