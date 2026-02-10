#piechart
import matplotlib.pyplot as plt

ll= 'SHOPPING', 'BILLS', 'EMI', 'FOOD','TRANSPORTATION'
sizes = [15,20,31,4,30]

fig, ax = plt.subplots()
ax.pie(sizes,labels = ll)

plt.show()