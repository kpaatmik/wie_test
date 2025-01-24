# Generated by Django 5.1.5 on 2025-01-24 20:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='appointment',
            name='duration',
            field=models.IntegerField(default=60, help_text='Duration in minutes'),
        ),
        migrations.AlterField(
            model_name='appointment',
            name='title',
            field=models.CharField(blank=True, default='Appointment', max_length=200),
        ),
    ]
