#income expense ratio
import matplotlib.pyplot as plt
import numpy as np
months = ("Jan","Feb","Mar","Apr","May","June","Jul","Aug","Sep","Oct","Nov","Dec")
x = np.arange(len(months))

weight_counts = {
    "income": np.array([100,96.7,40,67,76,28,79.9,60,43,80,70,59]),
    "expense": np.array([40,90,50,70,70,30,80,60,45,85,70,65]),
}
width = 0.5

fig, ax = plt.subplots()
bottom = np.zeros(len(months))
for label, counts in weight_counts.items():
    ax.bar(months,counts, width, label=label,bottom=bottom)
    bottom+=counts
ax.set_ylabel('Amount')
ax.set_title('Monthly Income vs Expense')
ax.set_xticks(x)
ax.legend()
plt.show()