# Generated by Django 5.1.5 on 2025-01-24 12:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pregnantwoman',
            name='due_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
