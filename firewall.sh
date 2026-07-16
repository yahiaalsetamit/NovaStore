# حذف جميع القواعد القديمة
iptables -F

# السياسة الافتراضية
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# السماح بالاتصالات المحلية
iptables -A INPUT -i lo -j ACCEPT

# السماح بالاتصالات التي تم إنشاؤها مسبقًا
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# السماح بـ SSH (اختياري إذا كنت تحتاجه)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# السماح لتطبيق Node.js
iptables -A INPUT -p tcp --dport 4000 -j ACCEPT

echo "Firewall rules applied successfully."