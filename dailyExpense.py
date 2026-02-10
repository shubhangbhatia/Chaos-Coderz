#daily expense of the month
import matplotlib.pyplot as plt
import numpy as np
amt = [32, 96.70, 45, 67, 76, 28, 79.9, 62, 43, 81, 70,
61, 95, 44, 60, 69, 71, 23, 69, 54, 76, 67,
82, 99.9, 26, 34, 18, 16, 59, 49.5]
days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
plt.title("DAILY EXPENSE DATA")
plt.xlabel("DAY")
plt.ylabel("AMOUNT")
plt.bar(days, amt,color='orange',width=0.5)
plt.xticks(days)
plt.show()